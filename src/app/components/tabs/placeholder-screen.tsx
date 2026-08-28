import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Text, View } from 'react-native';

type Props = { eyebrow: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; title: string };

export default function PlaceholderScreen({ eyebrow, icon, title }: Props) {
  return (
    <View className="flex-1 overflow-hidden bg-brand-body">
      <View className="flex-1 items-center justify-center px-6 pb-[88px]">
        <View className="mb-5 h-[58px] w-[58px] items-center justify-center rounded-[20px] border border-white/10 bg-primary">
          <MaterialCommunityIcons color="#FFFFFF" name={icon} size={28} />
        </View>
        <Text className="mb-[7px] text-xs font-bold uppercase tracking-[1.6px] text-muted">
          {eyebrow}
        </Text>
        <Text className="text-[32px] font-extrabold text-surface">{title}</Text>
        <Text className="mt-2.5 text-sm text-brand-text-muted">
          This screen is ready for its final content.
        </Text>
      </View>
    </View>
  );
}
