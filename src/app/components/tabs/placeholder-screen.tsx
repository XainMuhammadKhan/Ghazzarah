import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

type Props = { eyebrow: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; title: string };

export default function PlaceholderScreen({ eyebrow, icon, title }: Props) {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.iconCell}><MaterialCommunityIcons color="#FFFFFF" name={icon} size={28} /></View>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>This screen is ready for its final content.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden', backgroundColor: '#F5F5F4' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 88 },
  iconCell: { width: 58, height: 58, marginBottom: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.12)', backgroundColor: '#DC1E3D' },
  eyebrow: { marginBottom: 7, color: '#8C8C91', fontSize: 12, fontWeight: '700', letterSpacing: 1.6, textTransform: 'uppercase' },
  title: { color: '#17171A', fontSize: 32, fontWeight: '800' },
  description: { marginTop: 10, color: '#5A5A5F', fontSize: 14 },
});
