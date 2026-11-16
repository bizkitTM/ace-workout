import { DaySchedule, DecisionRule, WorkoutLog } from '../types/workout';

export const INITIAL_SCHEDULE: DaySchedule[] = [
  {
    dayOfWeek: 'Sunday',
    shortName: 'Sun',
    primaryFocus: 'Volleyball Match Play',
    modality: 'Volleyball',
    legImpact: 'Explosive Plyometrics',
    isVolleyballDay: true,
    isLegDayAllowed: false,
    legRuleNote: 'LOCKED: Game day. 80+ high-intensity jumps, blocks, lateral dives. No heavy lifting before or after.',
    whyItWorks: 'Peak match performance with fresh legs from Saturday strength (24h buffer).',
    durationMinutes: 120,
    intensity: 'High',
    targetExercises: [
      'Warmup dynamic mobility',
      'Jump spike approaches',
      'Defensive lateral footwork',
      'Post-match quad/patellar stretch'
    ]
  },
  {
    dayOfWeek: 'Monday',
    shortName: 'Mon',
    primaryFocus: 'Upper Body Pull & Core',
    modality: 'Resistance (Upper)',
    legImpact: 'None (Upper Focus)',
    isVolleyballDay: false,
    isLegDayAllowed: false,
    legRuleNote: 'BLOCKED: Legs in deep recovery from Sunday Volleyball. Focus 100% on back, biceps, and core.',
    whyItWorks: 'Back & pull muscles are completely fresh. Gives lower body full recovery before Tuesday volleyball.',
    durationMinutes: 50,
    intensity: 'Medium',
    targetExercises: [
      'Lat Pulldowns or Pull-ups (4x8-10)',
      'Seated Cable Rows (3x10-12)',
      'Face Pulls (3x15)',
      'Incline Dumbbell Curls (3x12)',
      'Hanging Knee Raises / Planks (3 sets)'
    ]
  },
  {
    dayOfWeek: 'Tuesday',
    shortName: 'Tue',
    primaryFocus: 'Volleyball Match Play',
    modality: 'Volleyball',
    legImpact: 'Explosive Plyometrics',
    isVolleyballDay: true,
    isLegDayAllowed: false,
    legRuleNote: 'LOCKED: Game day. High CNS output and eccentric jump landings.',
    whyItWorks: 'Legs are rested 48h since Sunday. Upper pull from Monday doesn’t interfere with spiking or serving.',
    durationMinutes: 120,
    intensity: 'High',
    targetExercises: [
      'Shoulder rotator cuff warmup (bands)',
      'Dynamic hip & ankle mobility',
      'Match play (3-4 sets)'
    ]
  },
  {
    dayOfWeek: 'Wednesday',
    shortName: 'Wed',
    primaryFocus: 'Upper Body Push & Rotator Cuff',
    modality: 'Resistance (Upper)',
    legImpact: 'None (Upper Focus)',
    isVolleyballDay: false,
    isLegDayAllowed: false,
    legRuleNote: 'BLOCKED: Legs recovering from Tuesday Volleyball. Wednesday is dedicated upper push day.',
    whyItWorks: 'Chest & triceps focus. Keeping volume moderate so shoulders aren’t fried for Thursday volleyball.',
    durationMinutes: 50,
    intensity: 'Medium',
    targetExercises: [
      'Dumbbell Incline Bench Press (4x8-10)',
      'Overhead Dumbbell Press (3x10)',
      'Cable Lateral Raises (3x15)',
      'Tricep Rope Pushdowns (3x12)',
      'Band External Rotations (2x20)'
    ]
  },
  {
    dayOfWeek: 'Thursday',
    shortName: 'Thu',
    primaryFocus: 'Volleyball Match Play',
    modality: 'Volleyball',
    legImpact: 'Explosive Plyometrics',
    isVolleyballDay: true,
    isLegDayAllowed: false,
    legRuleNote: 'LOCKED: Final midweek game day. High knee/ankle stress.',
    whyItWorks: 'Third weekly plyometric jumping session. Finishes the midweek competitive block.',
    durationMinutes: 120,
    intensity: 'High',
    targetExercises: [
      'Band mobility & patellar activation',
      'Match play (3-4 sets)',
      'Cool down & ice/mobility if needed'
    ]
  },
  {
    dayOfWeek: 'Friday',
    shortName: 'Fri',
    primaryFocus: 'VO2 Max Cardio or Aerobic Base',
    modality: 'VO2 Max / Cardio',
    legImpact: 'Cardio Base',
    isVolleyballDay: false,
    isLegDayAllowed: false,
    legRuleNote: 'BLOCKED: Legs fatigued from Thursday VB. Use low-impact treadmill / bike for cardiovascular stimulus.',
    whyItWorks: 'Cardiovascular peak day without heavy eccentric muscle damage. Keeps heart strong without taxing tendons.',
    durationMinutes: 40,
    intensity: 'High',
    targetExercises: [
      'Norwegian 4x4 Intervals (4 mins @ 90% HR, 3 mins recovery x 4 sets)',
      'OR: Sole F80 30-min Zone 2 Aerobic Jog/Incline Walk (HR 120-135)',
      '5-min cooldown walk & diaphragmatic breathing'
    ]
  },
  {
    dayOfWeek: 'Saturday',
    shortName: 'Sat',
    primaryFocus: 'Lower Body Strength Anchor',
    modality: 'Resistance (Lower)',
    legImpact: 'Heavy Resistance',
    isVolleyballDay: false,
    isLegDayAllowed: true,
    legRuleNote: 'OPEN WINDOW: The single golden slot of the week for heavy squats, deadlifts, and hamstring building.',
    whyItWorks: 'No volleyball yesterday (Friday) and 24 hours of rest before Sunday game. Best window to build resilient tendons and glutes.',
    durationMinutes: 60,
    intensity: 'High',
    targetExercises: [
      'Barbell Box Squats or Trap Bar Deadlift (4x6-8)',
      'Romanian Deadlifts / Hamstring Curls (3x10-12)',
      'Bulgarian Split Squats (3x8/leg - knee health)',
      'Standing Calf Raises (3x15)',
      'Tibialis & Ankle Mobility Work'
    ]
  }
];

export const INITIAL_RULES: DecisionRule[] = [
  {
    id: 'volleyball-leg-constraint',
    title: 'The Volleyball Adjacency Rule (Why Legs Are Saturday Only)',
    category: 'Legs & Recovery',
    dateAdded: '2026-11-16',
    constraint: 'Volleyball occurs 3x weekly (Tue, Thu, Sun). Heavy squats/deadlifts on the day of or day after volleyball causes acute tendon overload, DOMS, and destroys jump verticality.',
    rationale: 'Volleyball already delivers 200+ maximum-effort plyometric jumps per week. Adding heavy lifting during Sun-Fri creates overlapping eccentric damage on the knees and nervous system.',
    compromiseOrRule: 'Saturday is the dedicated Lower Body Strength anchor. Friday is kept to non-impact/cardio, leaving Saturday with zero prior-day volleyball and a clean 24-hour buffer before Sunday game play.',
    status: 'Active Rule'
  },
  {
    id: 'upper-body-split-balance',
    title: 'Upper Body Push/Pull Sequencing Around Game Days',
    category: 'Upper Body Split',
    dateAdded: '2026-11-16',
    constraint: 'Lifting heavy shoulders or chest the morning of volleyball leads to dead arms and rotator cuff strain when spiking.',
    rationale: 'Monday (Pull) and Wednesday (Push) place lifting on days between volleyball games, using upper muscle groups that do not fatigue the legs.',
    compromiseOrRule: 'Monday handles heavy Back & Pulling (lat pulldowns, rows, biceps). Wednesday handles Chest, Shoulders, and Triceps with moderate volume to preserve shoulder mobility for Thursday volleyball.',
    status: 'Active Rule'
  },
  {
    id: 'vo2-max-placement-friday',
    title: 'Friday Cardiovascular & VO2 Max Engine Building',
    category: 'Cardio & VO2 Max',
    dateAdded: '2026-11-16',
    constraint: 'High-intensity interval running cannot be placed right before volleyball matches without degrading game endurance.',
    rationale: 'Friday sits right after Thursday volleyball and before Saturday lifting. It is the ideal day to push maximum aerobic capacity (Norwegian 4x4 or treadmill hill intervals).',
    compromiseOrRule: 'Execute Norwegian 4x4 intervals on Friday. If legs feel heavy from Thursday volleyball, pivot immediately to low-impact incline treadmill walking or stationary cycling.',
    status: 'Active Rule'
  },
  {
    id: 'oura-readiness-downgrade',
    title: 'Oura Readiness Adaptive Training Governor',
    category: 'Oura Readiness',
    dateAdded: '2026-11-16',
    constraint: 'Training through low sleep score (<60) or tanked HRV (<15ms) leads to accumulated autonomic fatigue and elevated resting heart rate.',
    rationale: 'Data from Oura shows resting heart rate spikes and recovery indexes drop when pushing high-intensity workouts on poor sleep nights.',
    compromiseOrRule: 'If Oura Readiness is below 70 or HRV Balance is poor: Downgrade planned VO2 Max to Zone 2 walking/mobility; reduce resistance volume from 4 sets to 2 sets. Never force max lifts on sub-70 readiness.',
    status: 'Active Rule'
  },
  {
    id: 'creatine-daily-protocol',
    title: 'Daily 5g Creatine Monohydrate Saturation',
    category: 'Nutrition & Supplements',
    dateAdded: '2026-11-16',
    constraint: 'Creatine causes stomach sensitivity on empty stomach and fails to dissolve in cold liquids.',
    rationale: 'Continuous 5g daily intake maintains 100% intramuscular phosphocreatine stores for explosive jump power, resistance stamina, and cognitive function.',
    compromiseOrRule: 'Take 5g Micronized Creatine Monohydrate daily dissolved in morning hot coffee/tea (100% dissolve, zero grit) with breakfast, paired with extra 16-20 oz water intake.',
    status: 'Active Rule'
  }
];

export const INITIAL_LOGS: WorkoutLog[] = [
  {
    id: 'log-2026-11-16',
    date: '2026-11-16',
    dayOfWeek: 'Monday',
    title: 'Monday Upper Body (Chest & Push Focus)',
    modality: 'Resistance (Upper)',
    completed: true,
    durationMinutes: 45,
    legFatigueRating: 2,
    rpe: 8,
    exercises: [
      { id: '1', name: 'Barbell Bench Press', sets: 4, reps: '6, 6, 6, 2', weight: '72, 92, 112, 117 lbs' },
      { id: '2', name: 'Dumbbell Flys', sets: 3, reps: '6, 6, 6', weight: '25, 30, 35 lbs' },
      { id: '3', name: 'Dumbbell Press', sets: 3, reps: '6, 6, 6', weight: '25, 30, 35 lbs' },
      { id: '4', name: 'Dumbbell Pullovers', sets: 3, reps: '6, 6, 6', weight: '25, 40, 55 lbs' }
    ],
    notes: 'Solid chest/push session. Pyramid loading up to 117 lbs on bench press, finished with heavy 55 lb pullovers. Zero leg fatigue carryover before Tuesday volleyball.'
  },
  {
    id: 'log-2026-11-15',
    date: '2026-11-15',
    dayOfWeek: 'Sunday',
    title: 'Sunday Volleyball League Matches',
    modality: 'Volleyball',
    completed: true,
    durationMinutes: 110,
    legFatigueRating: 4,
    rpe: 8,
    notes: 'Intense match play. High active calorie burn (~1,700 kcal). Jump power felt solid. Knees felt good after pre-match dynamic band warmup.',
    ouraReadinessScore: 70
  },
  {
    id: 'log-2026-11-14',
    date: '2026-11-14',
    dayOfWeek: 'Saturday',
    title: 'Saturday Lower Body Strength Anchor',
    modality: 'Resistance (Lower)',
    completed: true,
    durationMinutes: 55,
    legFatigueRating: 3,
    rpe: 7,
    exercises: [
      { id: '1', name: 'Trap Bar Deadlift', sets: 4, reps: '8 reps', weight: '205 lbs' },
      { id: '2', name: 'Goblet Box Squats', sets: 3, reps: '10 reps', weight: '60 lbs' },
      { id: '3', name: 'Romanian Deadlifts (Dumbbells)', sets: 3, reps: '12 reps', weight: '50 lbs DBs' },
      { id: '4', name: 'Bulgarian Split Squats', sets: 3, reps: '8/leg', weight: 'Bodyweight + 25 lbs' }
    ],
    notes: 'Felt great having a dedicated leg day with zero volleyball immediately before or after. Hamstrings felt engaged.',
    ouraReadinessScore: 76
  }
];
