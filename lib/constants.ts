import { HabitDefinition } from '@/types';

export const PREDEFINED_HABITS: HabitDefinition[] = [
    // Healthy Habits
    { id: 'habit_entrenamiento', name: 'Entrenamiento', type: 'healthy', score: 4, icon: '💪' },
    { id: 'habit_leer', name: 'Leer', type: 'healthy', score: 3, icon: '📚' },
    { id: 'habit_yoga', name: 'Yoga', type: 'healthy', score: 3, icon: '🧘' },
    { id: 'habit_agua', name: 'Agua', type: 'healthy', score: 1, icon: '💧' },
    { id: 'habit_comida_saludable', name: 'Comida Saludable', type: 'healthy', score: 2, icon: '🥗' },
    { id: 'habit_bicicleta', name: 'Bicicleta', type: 'healthy', score: 2, icon: '🚴' },
    { id: 'habit_skate', name: 'Skate', type: 'healthy', score: 2, icon: '🛹' },
    { id: 'habit_surf', name: 'Surf', type: 'healthy', score: 3, icon: '🌊' },
    { id: 'habit_sueno', name: '8h de sueño', type: 'healthy', score: 4, icon: '😴' },
    { id: 'habit_coding', name: 'Coding', type: 'healthy', score: 2, icon: '💻' },

    // Unhealthy Habits
    { id: 'habit_golosina', name: 'Golosina', type: 'unhealthy', score: -2, icon: '🍬' },
    { id: 'habit_comida_rapida', name: 'Comida Rápida', type: 'unhealthy', score: -3, icon: '🍔' },
    { id: 'habit_alcohol', name: 'Alcohol', type: 'unhealthy', score: -4, icon: '🍺' },
    { id: 'habit_redes_sociales', name: 'Redes Sociales', type: 'unhealthy', score: -2, icon: '📱' },
    { id: 'habit_procrastinacion', name: 'Procrastinación', type: 'unhealthy', score: -3, icon: '⏳' },
];
