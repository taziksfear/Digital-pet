import React from 'react';
import MainScreen from '../components/MainScreen';

export default function SleepView({ costume, character }) {
    return <MainScreen state="sleep" costume={costume} character={character} />;
}