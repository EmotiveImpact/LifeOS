import { Redirect } from 'expo-router';
/** Old tab URL retained as a deep-link redirect, not an extra screen. */
export default function Discover() { return <Redirect href="/(tabs)/plan" />; }
