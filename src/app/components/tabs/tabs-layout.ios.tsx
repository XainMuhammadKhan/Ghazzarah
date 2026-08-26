import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function IosTabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index" contentStyle={{ backgroundColor: '#F5F5F4' }}><NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} /><NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="transactions" contentStyle={{ backgroundColor: '#F5F5F4' }}><NativeTabs.Trigger.Icon sf="arrow.left.arrow.right" /><NativeTabs.Trigger.Label>Transactions</NativeTabs.Trigger.Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="add-transaction" contentStyle={{ backgroundColor: '#F5F5F4' }}><NativeTabs.Trigger.Icon sf="plus" /><NativeTabs.Trigger.Label>Add</NativeTabs.Trigger.Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="assistant" contentStyle={{ backgroundColor: '#F5F5F4' }}><NativeTabs.Trigger.Icon sf="sparkles" /><NativeTabs.Trigger.Label>Assistant</NativeTabs.Trigger.Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile" contentStyle={{ backgroundColor: '#F5F5F4' }}><NativeTabs.Trigger.Icon sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }} /><NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label></NativeTabs.Trigger>
    </NativeTabs>
  );
}
