import { Redirect } from 'expo-router';

export default function Application({ children }: any) {
  return <Redirect href="/home" />;
}