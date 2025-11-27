import { HabitDefinition } from '@/types';

export const PREDEFINED_HABITS: Omit<HabitDefinition, 'id'>[] = [
    // Healthy Habits
    { name: 'Entrenamiento', type: 'healthy', score: 4, icon: '💪' },
    { name: 'Leer', type: 'healthy', score: 3, icon: '📚' },
    { name: 'Yoga', type: 'healthy', score: 3, icon: '🧘' },
    { name: 'Agua', type: 'healthy', score: 1, icon: '💧' },
    { name: 'Comida Saludable', type: 'healthy', score: 2, icon: '🥗' },
    { name: 'Bicicleta', type: 'healthy', score: 2, icon: '🚴' },
    { name: 'Skate', type: 'healthy', score: 2, icon: '🛹' },
    { name: 'Surf§', type: 'healthy', score: 3, icon: '🌊' },
    { name: '8h de sueño', type: 'healthy', score: 4, icon: '😴' },
    { name: 'Coding', type: 'healthy', score: 2, icon: '💻' },

    // Unhealthy Habits
    { name: 'Golosina', type: 'unhealthy', score: -2, icon: '🍬' },
    { name: 'Comida Rápida', type: 'unhealthy', score: -3, icon: '🍔' },
    { name: 'Alcohol', type: 'unhealthy', score: -4, icon: '🍺' },
    { name: 'Redes Sociales', type: 'unhealthy', score: -2, icon: '📱' },
    { name: 'Procrastinación', type: 'unhealthy', score: -3, icon: '⏳' },
];
