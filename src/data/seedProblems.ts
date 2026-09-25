import { Problem } from '../domain/models/Problem.js';

export const SEED_PROBLEMS: Problem[] = [
  new Problem(
    'prob-parking-lot',
    'parking-lot',
    'Smart Parking Lot System',
    'Design an automated multi-level parking lot supporting different vehicle types, dynamic fee calculation, spot allocation strategies, and concurrent ticketing.',
    'MEDIUM',
    [
      'Support multiple vehicle types: Motorcycle, Compact Car, Large SUV, Electric Vehicle (EV), and Bus/Truck.',
      'A parking lot consists of multiple floors, each with designated spots matching vehicle sizes.',
      'Automated Entry & Exit Gates: Entry gate issues a Ticket with timestamp and assigned spot; Exit gate processes payment and vacates the spot.',
      'Dynamic Spot Allocation Strategy: nearest to entrance, best-fit, or random allocation.',
      'Dynamic Fee Calculation Strategy: hourly rates with vehicle multipliers, free grace period (15 mins), and EV charging surcharges.',
      'Display boards at each floor showing real-time available spots per vehicle category.'
    ],
    [
      'Thread safety: Prevent race conditions when multiple entry gates attempt to allocate the last remaining spot.',
      'Extensibility: Adding a new vehicle type or a surge pricing algorithm should not require changing existing classes (OCP).',
      'High cohesion & Single Responsibility: Avoid a monolithic ParkingLotManager class that handles fees, spots, gates, and persistence.'
    ],
    ['Vehicle', 'ParkingSpot', 'ParkingLot', 'ParkingFloor', 'Ticket', 'Payment', 'Gate'],
    ['Strategy Pattern (Spot Allocation & Pricing)', 'Factory Pattern (Vehicle/Spot Creation)', 'Observer Pattern (Display Board updates)'],
    {
      singleResponsibility: 25,
      openClosedExtensibility: 25,
      interfaceSegregationDIP: 15,
      patternAppropriateness: 15,
      stateAndConcurrency: 10,
      edgeCasesRobustness: 10
    },
    {
      language: 'cpp',
      assumptions: '',
      classDiagramMermaid: 'classDiagram\n    %% Define your classes and relationships\n',
      sourceCode: '',
      patternJustification: ''
    },
    [
      'Think about how you prevent race conditions when two cars arrive at two different gates simultaneously.',
      'Separate the fee calculation from ticket management so you can change pricing rules easily (Strategy Pattern).'
    ]
  ),

  new Problem(
    'prob-elevator-system',
    'elevator-system',
    'Elevator Controller System',
    'Design an elevator dispatch and control system for a high-rise building with multiple elevators, internal/external call buttons, and scheduling policies.',
    'HARD',
    [
      'Manage multiple elevator cars operating across N floors.',
      'External Hall Calls: Passengers on any floor can press UP or DOWN buttons.',
      'Internal Car Calls: Passengers inside the elevator car can select target destination floor(s).',
      'Elevator States: IDLE, MOVING_UP, MOVING_DOWN, DOOR_OPEN, MAINTENANCE.',
      'Scheduling Strategy: LOOK / SCAN algorithm or Shortest Seek Time First (SSTF) to minimize passenger wait times.',
      'Safety & Emergency: Emergency stop button, maximum weight capacity threshold, fire alarm recall mode.'
    ],
    [
      'Decouple dispatching algorithm from mechanical car movement.',
      'Ensure thread-safe queuing of internal and external floor requests.',
      'Prevent starvation: passengers requesting opposite directions should eventually be served.'
    ],
    ['ElevatorCar', 'ElevatorController', 'HallButton', 'ElevatorButton', 'FloorRequest', 'Dispatcher', 'ElevatorState'],
    ['State Pattern (Elevator Motion & Door)', 'Strategy Pattern (Dispatching Algorithm)', 'Command Pattern (Button requests)'],
    {
      singleResponsibility: 20,
      openClosedExtensibility: 25,
      interfaceSegregationDIP: 20,
      patternAppropriateness: 15,
      stateAndConcurrency: 10,
      edgeCasesRobustness: 10
    },
    {
      language: 'cpp',
      assumptions: '',
      classDiagramMermaid: 'classDiagram\n    %% Define your classes and relationships\n',
      sourceCode: '',
      patternJustification: ''
    },
    [
      'Model elevator states as state objects rather than a giant switch statement inside a loop (State Pattern).',
      'Decouple dispatching strategy so you can switch between SCAN and Nearest-Car algorithms (Strategy Pattern).'
    ]
  ),

  new Problem(
    'prob-vending-machine',
    'vending-machine',
    'Vending Machine with State Pattern',
    'Design an interactive vending machine that accepts multiple denominations, maintains product inventory, handles exact change, and guards valid state transitions.',
    'MEDIUM',
    [
      'Supports states: Ready / Idle, Has Money (Selecting), Dispensing, Out of Stock, Refunding.',
      'Supports inventory management across distinct item slots (Soda, Chips, Candy).',
      'Calculates change automatically and returns remaining coins/notes.',
      'Handles cancellation/refund request at any time prior to dispensing.',
      'Handles edge cases: exact change not available, coin jam, insufficient balance.'
    ],
    [
      'State Pattern must be used to eliminate invalid state transitions.',
      'Thread safety for inventory deduction and coin balance changes.'
    ],
    ['VendingMachine', 'VendingState', 'Item', 'Inventory', 'Coin', 'Dispenser'],
    ['State Pattern', 'Factory Pattern (Item creation)'],
    {
      singleResponsibility: 25,
      openClosedExtensibility: 20,
      interfaceSegregationDIP: 20,
      patternAppropriateness: 20,
      stateAndConcurrency: 10,
      edgeCasesRobustness: 5
    },
    {
      language: 'cpp',
      assumptions: '',
      classDiagramMermaid: 'classDiagram\n    %% Define your classes and relationships\n',
      sourceCode: '',
      patternJustification: ''
    },
    [
      'Represent machine states (Idle, HasMoney, Dispensing) as separate classes implementing a State interface.',
      'Encapsulate currency calculation and coin handling separately from product inventory.'
    ]
  ),

  new Problem(
    'prob-lru-cache',
    'lru-cache',
    'Thread-Safe LRU Cache with Eviction Policy',
    'Design an in-memory Key-Value Cache with configurable maximum capacity, pluggable eviction policies (LRU, LFU, FIFO), and strict thread safety.',
    'HARD',
    [
      'O(1) average time complexity for both get(key) and put(key, value) operations.',
      'Pluggable eviction policy via Strategy / Policy abstraction (default: Least Recently Used).',
      'Thread safety: multiple concurrent readers and writers without data corruption or deadlocks.',
      'TTL (Time-to-Live) expiration per cache entry (optional bonus).'
    ],
    [
      'Decouple cache storage from eviction tracking.',
      'Fine-grained locking or ReadWriteLock to maximize concurrent read throughput.'
    ],
    ['Cache', 'Node', 'DoublyLinkedList', 'EvictionPolicy', 'Storage'],
    ['Strategy Pattern (Eviction Policy)', 'Decorator Pattern (TTL or Metrics monitoring)'],
    {
      singleResponsibility: 25,
      openClosedExtensibility: 25,
      interfaceSegregationDIP: 20,
      patternAppropriateness: 15,
      stateAndConcurrency: 15,
      edgeCasesRobustness: 5
    },
    {
      language: 'cpp',
      assumptions: '',
      classDiagramMermaid: 'classDiagram\n    %% Define your classes and relationships\n',
      sourceCode: '',
      patternJustification: ''
    },
    [
      'Combine a Hash Map for O(1) key lookups with a Doubly Linked List for O(1) eviction updates.',
      'Extract the eviction logic into an EvictionPolicy interface so FIFO, LFU, or LRU can be swapped.'
    ]
  )
];
