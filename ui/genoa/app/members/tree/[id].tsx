import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Line } from 'react-native-svg';

import { getToken } from '../../../services/auth';
import { API_BASE_URL } from '../../../config';
import { Colors } from '../../../constants/Colors';
import { globalStyles } from '../../../styles/global.styles';

interface Person {
  _id: string;
  nom: string;
  prenom: string;
  dateNaissance?: string;
}

interface Relations {
  parents: Person[];
  conjoints: Person[];
  enfants: Person[];
  fratrie: Person[];
}

type NodeKind = 'center' | 'parent' | 'conjoint' | 'child' | 'sibling';

type NodePosition = Record<string, { x: number; y: number }>;
type NodeMeta = Record<string, { person: Person; kind: NodeKind }>;

const SIZE = {
  normal: {
    width: 180,
    height: 78,
    spouseGap: 230,
    parentY: 170,
    childY: 230,
    siblingGap: 220,
    parentGap: 230,
    childGap: 190,
  },
  compact: {
    width: 150,
    height: 60,
    spouseGap: 190,
    parentY: 150,
    childY: 190,
    siblingGap: 180,
    parentGap: 190,
    childGap: 160,
  },
};

const MIN_SCALE = 0.7;
const MAX_SCALE = 2;
const BASE_CANVAS_WIDTH = 1300;
const BASE_CANVAS_HEIGHT = 820;

export default function MemberTreeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [member, setMember] = useState<Person | null>(null);
  const [relations, setRelations] = useState<Relations>({
    parents: [],
    conjoints: [],
    enfants: [],
    fratrie: [],
  });
  const [loading, setLoading] = useState(true);

  const [showParents, setShowParents] = useState(true);
  const [showFratrie, setShowFratrie] = useState(false);
  const [showConjoints, setShowConjoints] = useState(false);
  const [showEnfants, setShowEnfants] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [mode, setMode] = useState<'all' | 'asc' | 'desc'>('all');

  const [scale, setScale] = useState(1);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const dims = compactMode ? SIZE.compact : SIZE.normal;
  const nodeWidth = dims.width;
  const nodeHeight = dims.height;

  const applyScale = useCallback(
    (next: number) => {
      const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, next));
      setScale(clamped);

      Animated.timing(scaleAnim, {
        toValue: clamped,
        duration: 120,
        useNativeDriver: true,
      }).start();
    },
    [scaleAnim]
  );

  const zoomIn = () => applyScale(scale + 0.1);
  const zoomOut = () => applyScale(scale - 0.1);
  const resetZoom = () => applyScale(1);

  const fetchTree = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const token = await getToken();

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [memberRes, relRes] = await Promise.all([
        fetch(`${API_BASE_URL}/members/${id}`, { headers }),
        fetch(`${API_BASE_URL}/members/${id}/relations`, { headers }),
      ]);

      const [memberData, relData] = await Promise.all([
        memberRes.json(),
        relRes.json(),
      ]);

      if (memberRes.ok) {
        setMember(memberData);
      } else {
        setMember(null);
      }

      if (relRes.ok) {
        setRelations({
          parents: relData.parents || [],
          conjoints: relData.conjoints || [],
          enfants: relData.enfants || [],
          fratrie: relData.fratrie || [],
        });
      } else {
        setRelations({
          parents: [],
          conjoints: [],
          enfants: [],
          fratrie: [],
        });
      }
    } catch (error) {
      console.error('Erreur arbre familial:', error);
      setMember(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchTree();
    }, [fetchTree])
  );

  const goToTree = (personId: string) => router.push(`/members/tree/${personId}`);
  const goToDetail = (personId: string) => router.push(`/members/${personId}`);

  const kindLabel = (kind: NodeKind) => {
    switch (kind) {
      case 'center':
        return 'Membre central';
      case 'parent':
        return 'Parent';
      case 'conjoint':
        return 'Conjoint';
      case 'child':
        return 'Enfant';
      case 'sibling':
        return 'Fratrie';
      default:
        return '';
    }
  };

  const layout = useMemo(() => {
    if (!member) {
      return {
        pos: {} as NodePosition,
        meta: {} as NodeMeta,
        width: BASE_CANVAS_WIDTH,
        height: BASE_CANVAS_HEIGHT,
        centerId: '',
        spouseIds: [] as string[],
        coupleCenterX: BASE_CANVAS_WIDTH / 2,
        centerY: BASE_CANVAS_HEIGHT / 2 - 30,
      };
    }

    const pos: NodePosition = {};
    const meta: NodeMeta = {};

    const centerY = BASE_CANVAS_HEIGHT / 2 - 40;
    const canvasCenterX = BASE_CANVAS_WIDTH / 2;
    const visibleConjoints = showConjoints ? relations.conjoints : [];
    const firstSpouse = visibleConjoints[0] || null;

    const hasSpouse = !!firstSpouse;
    const coupleCenterX = canvasCenterX;

    const centerMemberX = hasSpouse
      ? coupleCenterX - dims.spouseGap / 2
      : coupleCenterX;

    pos[member._id] = { x: centerMemberX, y: centerY };
    meta[member._id] = { person: member, kind: 'center' };

    if (firstSpouse) {
      pos[firstSpouse._id] = {
        x: coupleCenterX + dims.spouseGap / 2,
        y: centerY,
      };
      meta[firstSpouse._id] = { person: firstSpouse, kind: 'conjoint' };
    }

    if (showParents && mode !== 'desc' && relations.parents.length > 0) {
      const totalWidth = (relations.parents.length - 1) * dims.parentGap;
      const startX = centerMemberX - totalWidth / 2;

      relations.parents.forEach((parent, index) => {
        pos[parent._id] = {
          x: startX + index * dims.parentGap,
          y: centerY - dims.parentY,
        };
        meta[parent._id] = { person: parent, kind: 'parent' };
      });
    }

    if (showFratrie && mode === 'all' && relations.fratrie.length > 0) {
      const siblings = relations.fratrie;
      const total = siblings.length;

      siblings.forEach((sibling, index) => {
        const isLeftSide = index % 2 === 0;
        const rank = Math.floor(index / 2) + 1;
        const offset = rank * dims.siblingGap;

        pos[sibling._id] = {
          x: centerMemberX + (isLeftSide ? -offset : offset),
          y: centerY,
        };
        meta[sibling._id] = { person: sibling, kind: 'sibling' };
      });

      if (total === 1) {
        pos[siblings[0]._id].x = centerMemberX - dims.siblingGap;
      }
    }

    if (showEnfants && mode !== 'asc' && relations.enfants.length > 0) {
      const childrenCenterX = hasSpouse ? coupleCenterX : centerMemberX;
      const totalWidth = (relations.enfants.length - 1) * dims.childGap;
      const startX = childrenCenterX - totalWidth / 2;

      relations.enfants.forEach((child, index) => {
        pos[child._id] = {
          x: startX + index * dims.childGap,
          y: centerY + dims.childY,
        };
        meta[child._id] = { person: child, kind: 'child' };
      });
    }

    const xs = Object.values(pos).map((p) => p.x);
    const ys = Object.values(pos).map((p) => p.y);

    const minX = Math.min(...xs) - nodeWidth;
    const maxX = Math.max(...xs) + nodeWidth;
    const minY = Math.min(...ys) - nodeHeight;
    const maxY = Math.max(...ys) + nodeHeight;

    const contentWidth = Math.max(BASE_CANVAS_WIDTH, maxX - minX + 120);
    const contentHeight = Math.max(BASE_CANVAS_HEIGHT, maxY - minY + 120);

    const offsetX = minX < 40 ? 40 - minX : 0;
    const offsetY = minY < 40 ? 40 - minY : 0;

    Object.keys(pos).forEach((key) => {
      pos[key] = {
        x: pos[key].x + offsetX,
        y: pos[key].y + offsetY,
      };
    });

    return {
      pos,
      meta,
      width: contentWidth,
      height: contentHeight,
      centerId: member._id,
      spouseIds: firstSpouse ? [firstSpouse._id] : [],
      coupleCenterX: coupleCenterX + offsetX,
      centerY: centerY + offsetY,
    };
  }, [
    member,
    relations,
    showParents,
    showFratrie,
    showConjoints,
    showEnfants,
    compactMode,
    dims,
    nodeWidth,
    nodeHeight,
    mode,
  ]);

  const edges = useMemo(() => {
    if (!member) return [];

    const result: Array<{
      type: 'parent' | 'conjoint' | 'child';
      from: string;
      to: string;
    }> = [];

    if (showParents && mode !== 'desc') {
      relations.parents.forEach((parent) => {
        result.push({ type: 'parent', from: parent._id, to: member._id });
      });
    }

    if (showConjoints && mode !== 'asc' && relations.conjoints[0]) {
      result.push({
        type: 'conjoint',
        from: member._id,
        to: relations.conjoints[0]._id,
      });
    }

    if (showEnfants && mode !== 'asc') {
      relations.enfants.forEach((child) => {
        result.push({ type: 'child', from: member._id, to: child._id });
      });
    }

    return result;
  }, [member, relations, showParents, showConjoints, showEnfants,mode]);

  const webWheelProps =
    Platform.OS === 'web'
      ? {
          onWheel: (e: any) => {
            const delta = e?.nativeEvent?.deltaY ?? 0;
            applyScale(scale + (delta > 0 ? -0.08 : 0.08));
          },
        }
      : {};

  if (loading) {
    return (
      <View style={globalStyles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!member) {
    return (
      <View style={globalStyles.centerContainer}>
        <Text style={globalStyles.errorText}>Membre introuvable</Text>
      </View>
    );
  }

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.screen}>
      <Text style={[globalStyles.title, styles.title]}>Arbre familial</Text>
      <Text style={styles.subtitle}>
        Vue centrée sur {member.prenom} {member.nom}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersWrapper}
      >
        <View style={styles.filtersGroup}>
          <Text style={styles.filterGroupTitle}>Relations affichées</Text>

          <View style={styles.filtersRow}>
            <FilterButton
              label="Parents"
              active={showParents}
              onPress={() => setShowParents((prev) => !prev)}
            />
            <FilterButton
              label="Fratrie"
              active={showFratrie}
              onPress={() => setShowFratrie((prev) => !prev)}
            />
            <FilterButton
              label="Conjoints"
              active={showConjoints}
              onPress={() => setShowConjoints((prev) => !prev)}
            />
            <FilterButton
              label="Enfants"
              active={showEnfants}
              onPress={() => setShowEnfants((prev) => !prev)}
            />
          </View>
          <Text style={styles.filterGroupTitle}>Mode: </Text>
          <View style={styles.filtersRow}>
            <FilterButton
              label="Tout"
              active={mode === 'all'}
              onPress={() => setMode('all')}
            />

            <FilterButton
              label="Ascendants"
              active={mode === 'asc'}
              onPress={() => setMode('asc')}
            />

            <FilterButton
              label="Descendants"
              active={mode === 'desc'}
              onPress={() => setMode('desc')}
            />
          </View>

          <Text style={styles.filterGroupTitle}>Champs affichés</Text>
          <View style={styles.filtersRow}>
            <FilterButton
              label="Compact"
              active={compactMode}
              onPress={() => setCompactMode((prev) => !prev)}
            />
            <FilterButton
              label={showDetails ? "Simple" : "Détail"}
              active={showDetails}
              onPress={() => setShowDetails((prev) => !prev)}
            />
          </View>
        </View>
      </ScrollView>

      <Text style={styles.legend}>
        Appui court : recentrer l’arbre • Appui long : ouvrir la fiche
      </Text>
      

      <View style={styles.zoomControls}>
        <ZoomButton label="−" onPress={zoomOut} />
        <ZoomButton label="100%" onPress={resetZoom} />
        <ZoomButton label="+" onPress={zoomIn} />
      </View>

      <View style={styles.treeCard}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator
          contentContainerStyle={styles.horizontalScroll}
        >
          <ScrollView
            showsVerticalScrollIndicator
            contentContainerStyle={styles.verticalScroll}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <View
                {...webWheelProps}
                style={[
                  styles.canvas,
                  {
                    width: layout.width,
                    height: layout.height,
                  },
                ]}
              >
                <Svg width={layout.width} height={layout.height} style={StyleSheet.absoluteFill}>
                  {edges.map((edge, index) => {
                    const from = layout.pos[edge.from];
                    const to = layout.pos[edge.to];
                    if (!from || !to) return null;

                    if (edge.type === 'conjoint') {
                      return (
                        <Line
                          key={`${edge.type}-${edge.from}-${edge.to}-${index}`}
                          x1={from.x + nodeWidth / 2}
                          y1={from.y}
                          x2={to.x - nodeWidth / 2}
                          y2={to.y}
                          stroke="#8FA58F"
                          strokeWidth="2.4"
                        />
                      );
                    }

                    if (edge.type === 'parent') {
                      return (
                        <Line
                          key={`${edge.type}-${edge.from}-${edge.to}-${index}`}
                          x1={from.x}
                          y1={from.y + nodeHeight / 2}
                          x2={to.x}
                          y2={to.y - nodeHeight / 2}
                          stroke="#8FA58F"
                          strokeWidth="2.2"
                        />
                      );
                    }

                    return (
                      <Line
                        key={`${edge.type}-${edge.from}-${edge.to}-${index}`}
                        x1={layout.spouseIds.length ? layout.coupleCenterX : from.x}
                        y1={from.y + nodeHeight / 2}
                        x2={to.x}
                        y2={to.y - nodeHeight / 2}
                        stroke="#8FA58F"
                        strokeWidth="2.2"
                      />
                    );
                  })}
                </Svg>

                {Object.entries(layout.pos).map(([personId, pos]) => {
                  const meta = layout.meta[personId];
                  if (!meta) return null;

                  return (
                    <TouchableOpacity
                      key={personId}
                      onPress={() => goToTree(personId)}
                      onLongPress={() => goToDetail(personId)}
                      activeOpacity={0.9}
                      style={[
                        styles.node,
                        compactMode && styles.nodeCompact,
                        meta.kind === 'center' && styles.nodeCenter,
                        {
                          left: pos.x - nodeWidth / 2,
                          top: pos.y - nodeHeight / 2,
                          width: nodeWidth,
                          height: nodeHeight,
                        },
                      ]}
                    >
                      <Text
                        numberOfLines={2}
                        style={[
                          styles.nodeName,
                          compactMode && styles.nodeNameCompact,
                          meta.kind === 'center' && styles.nodeNameCenter,
                        ]}
                      >
                        {meta.person.prenom} {meta.person.nom}
                      </Text>
                      {showDetails && (
                        <Text style={styles.sub}>
                          {meta.person.dateNaissance
                            ? `Né le ${meta.person.dateNaissance}`
                            : 'Date inconnue'}
                        </Text>
                      )}
                      {!compactMode && (
                        <Text style={styles.nodeKind}>{kindLabel(meta.kind)}</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          </ScrollView>
        </ScrollView>
      </View>
    </ScrollView>
  );
}

function FilterButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.filterButton, active && styles.filterButtonActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.filterButtonText, active && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ZoomButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.zoomButton} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.zoomButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: 20,
    paddingBottom: 28,
  },
  title: {
    marginTop: 0,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.secondary,
    marginBottom: 14,
  },
  filtersWrapper: {
    marginBottom: 10,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  filterButton: {
    backgroundColor: '#F3F5F4',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D7DEDA',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  filtersGroup: {
    gap: 10,
    paddingBottom: 4,
  },

  filterGroupTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 4,
  },
  legend: {
    fontSize: 13,
    color: Colors.secondary,
    marginBottom: 14,
    lineHeight: 18,
  },
  zoomControls: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  zoomButton: {
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  zoomButtonText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  treeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8ECEA',
    overflow: 'hidden',
  },
  horizontalScroll: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  verticalScroll: {
    alignItems: 'center',
  },
  canvas: {
    backgroundColor: '#FAFBFA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF1EF',
    position: 'relative',
  },
  node: {
    position: 'absolute',
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9DDDB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  nodeCenter: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: '#F5FBF5',
  },
  nodeCompact: {
    borderRadius: 13,
  },
  nodeName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
  },
  nodeNameCenter: {
    fontSize: 17,
  },
  nodeNameCompact: {
    fontSize: 13,
  },
  nodeKind: {
    marginTop: 6,
    fontSize: 11,
    color: Colors.secondary,
    textAlign: 'center',
  },
  detailButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  detailButtonActive: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  detailButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  detailButtonTextActive: {
    color: Colors.primary,
  },
  
});