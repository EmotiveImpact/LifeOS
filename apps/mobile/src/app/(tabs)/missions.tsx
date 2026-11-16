import { Redirect } from 'expo-router';
/** Old tab URL retained as a deep-link redirect to the specified mission list. */
export default function Missions() { return <Redirect href="/plan/missions" />; }
