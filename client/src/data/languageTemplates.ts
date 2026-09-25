export interface LanguageSkeletons {
  skeleton: string;
}

export const PROBLEM_TEMPLATES: Record<string, Record<string, LanguageSkeletons>> = {
  'parking-lot': {
    cpp: {
      skeleton: `// ==========================================
// SMART PARKING LOT SYSTEM (C++)
// Starting Scaffold: Define domain classes, spot allocation, and fee strategies
// ==========================================

#include <iostream>
#include <string>
#include <vector>
#include <memory>
#include <ctime>

enum class VehicleType {
    MOTORCYCLE,
    COMPACT,
    LARGE,
    ELECTRIC
};

// 1. Core Domain Entity: Vehicle
class Vehicle {
protected:
    std::string licensePlate;
    VehicleType type;
public:
    Vehicle(const std::string& plate, VehicleType t) : licensePlate(plate), type(t) {}
    virtual ~Vehicle() = default;
    VehicleType getType() const { return type; }
    std::string getPlate() const { return licensePlate; }
};

// 2. ParkingSpot Entity
class ParkingSpot {
private:
    std::string id;
    VehicleType type;
    bool occupied = false;
    std::shared_ptr<Vehicle> currentVehicle = nullptr;
public:
    ParkingSpot(const std::string& spotId, VehicleType t) : id(spotId), type(t) {}
    bool isAvailable() const { return !occupied; }
    void occupy(std::shared_ptr<Vehicle> v) {
        // TODO: Validate availability and assign vehicle
    }
    void vacate() {
        // TODO: Reset occupancy
    }
    VehicleType getType() const { return type; }
};

// 3. Strategy Patterns for Extensibility (OCP)
class SpotAllocationStrategy {
public:
    virtual ~SpotAllocationStrategy() = default;
    virtual std::shared_ptr<ParkingSpot> findSpot(const std::vector<std::shared_ptr<ParkingSpot>>& spots, std::shared_ptr<Vehicle> vehicle) = 0;
};

class FeeCalculationStrategy {
public:
    virtual ~FeeCalculationStrategy() = default;
    virtual double calculateFee(double durationHours, VehicleType type) = 0;
};

// 4. Central System Orchestrator
class ParkingLot {
private:
    std::vector<std::shared_ptr<ParkingSpot>> spots;
    std::shared_ptr<SpotAllocationStrategy> allocationStrategy;
    std::shared_ptr<FeeCalculationStrategy> feeStrategy;
public:
    ParkingLot(std::shared_ptr<SpotAllocationStrategy> alloc, std::shared_ptr<FeeCalculationStrategy> fee)
        : allocationStrategy(alloc), feeStrategy(fee) {}

    void parkVehicle(std::shared_ptr<Vehicle> vehicle) {
        // TODO: Allocate spot via strategy and record entry
    }

    double processExit(const std::string& ticketId) {
        // TODO: Vacate spot and calculate fee via strategy
        return 0.0;
    }
};`
    },
    java: {
      skeleton: `// ==========================================
// SMART PARKING LOT SYSTEM (Java)
// Starting Scaffold: Define domain classes, spot allocation, and fee strategies
// ==========================================

import java.util.*;

enum VehicleType {
    MOTORCYCLE, COMPACT, LARGE, ELECTRIC
}

// 1. Core Domain Entity: Vehicle
abstract class Vehicle {
    protected String licensePlate;
    protected VehicleType type;

    public Vehicle(String licensePlate, VehicleType type) {
        this.licensePlate = licensePlate;
        this.type = type;
    }
    public VehicleType getType() { return type; }
    public String getLicensePlate() { return licensePlate; }
}

// 2. ParkingSpot Entity
class ParkingSpot {
    private String id;
    private VehicleType type;
    private boolean occupied = false;
    private Vehicle currentVehicle = null;

    public ParkingSpot(String id, VehicleType type) {
        this.id = id;
        this.type = type;
    }

    public synchronized boolean isAvailable() { return !occupied; }
    public synchronized void occupy(Vehicle v) {
        // TODO: Validate availability and assign vehicle
    }
    public synchronized void vacate() {
        // TODO: Reset occupancy
    }
    public VehicleType getType() { return type; }
}

// 3. Strategy Patterns for Extensibility (OCP)
interface SpotAllocationStrategy {
    ParkingSpot findSpot(List<ParkingSpot> spots, Vehicle vehicle);
}

interface FeeCalculationStrategy {
    double calculateFee(double durationHours, VehicleType type);
}

// 4. Central System Orchestrator
class ParkingLot {
    private List<ParkingSpot> spots = new ArrayList<>();
    private SpotAllocationStrategy allocationStrategy;
    private FeeCalculationStrategy feeStrategy;

    public ParkingLot(SpotAllocationStrategy alloc, FeeCalculationStrategy fee) {
        this.allocationStrategy = alloc;
        this.feeStrategy = fee;
    }

    public synchronized void parkVehicle(Vehicle vehicle) {
        // TODO: Allocate spot via strategy and record entry
    }

    public synchronized double processExit(String ticketId) {
        // TODO: Vacate spot and calculate fee via strategy
        return 0.0;
    }
}`
    },
    python: {
      skeleton: `# ==========================================
# SMART PARKING LOT SYSTEM (Python)
# Starting Scaffold: Define domain classes, spot allocation, and fee strategies
# ==========================================

from enum import Enum
from abc import ABC, abstractmethod
from typing import List, Optional
import time

class VehicleType(Enum):
    MOTORCYCLE = 1
    COMPACT = 2
    LARGE = 3
    ELECTRIC = 4

# 1. Core Domain Entity: Vehicle
class Vehicle(ABC):
    def __init__(self, license_plate: str, vehicle_type: VehicleType):
        self.license_plate = license_plate
        self.vehicle_type = vehicle_type

# 2. ParkingSpot Entity
class ParkingSpot:
    def __init__(self, spot_id: str, spot_type: VehicleType):
        self.spot_id = spot_id
        self.spot_type = spot_type
        self.occupied = False
        self.current_vehicle: Optional[Vehicle] = None

    def is_available(self) -> bool:
        return not self.occupied

    def occupy(self, vehicle: Vehicle) -> None:
        # TODO: Validate availability and assign vehicle
        pass

    def vacate(self) -> None:
        # TODO: Reset occupancy
        pass

# 3. Strategy Patterns for Extensibility (OCP)
class SpotAllocationStrategy(ABC):
    @abstractmethod
    def find_spot(self, spots: List[ParkingSpot], vehicle: Vehicle) -> Optional[ParkingSpot]:
        pass

class FeeCalculationStrategy(ABC):
    @abstractmethod
    def calculate_fee(self, duration_hours: float, vehicle_type: VehicleType) -> float:
        pass

# 4. Central System Orchestrator
class ParkingLot:
    def __init__(self, allocation_strategy: SpotAllocationStrategy, fee_strategy: FeeCalculationStrategy):
        self.spots: List[ParkingSpot] = []
        self.allocation_strategy = allocation_strategy
        self.fee_strategy = fee_strategy

    def park_vehicle(self, vehicle: Vehicle):
        # TODO: Allocate spot via strategy and record entry
        pass

    def process_exit(self, ticket_id: str) -> float:
        # TODO: Vacate spot and calculate fee via strategy
        return 0.0`
    }
  },

  'elevator-system': {
    cpp: {
      skeleton: `// ==========================================
// ELEVATOR CONTROLLER SYSTEM (C++)
// Starting Scaffold: Define state machine and dispatching logic
// ==========================================

#include <iostream>
#include <string>
#include <vector>
#include <memory>

enum class Direction { UP, DOWN, IDLE };
enum class ElevatorState { IDLE, MOVING_UP, MOVING_DOWN, DOOR_OPEN, MAINTENANCE };

class ElevatorCar {
private:
    std::string id;
    int currentFloor = 0;
    Direction direction = Direction.IDLE;
    ElevatorState state = ElevatorState.IDLE;
    std::vector<int> destinationFloors;
public:
    ElevatorCar(const std::string& carId) : id(carId) {}
    void addDestination(int floor) { /* TODO */ }
    void step() { /* TODO */ }
};

class DispatchStrategy {
public:
    virtual ~DispatchStrategy() = default;
    virtual std::shared_ptr<ElevatorCar> selectElevator(
        const std::vector<std::shared_ptr<ElevatorCar>>& cars, int floor, Direction dir) = 0;
};

class ElevatorController {
private:
    std::vector<std::shared_ptr<ElevatorCar>> elevators;
    std::shared_ptr<DispatchStrategy> strategy;
public:
    ElevatorController(const std::vector<std::shared_ptr<ElevatorCar>>& cars, std::shared_ptr<DispatchStrategy> strat)
        : elevators(cars), strategy(strat) {}
    void handleHallCall(int floor, Direction dir) { /* TODO */ }
};`
    },
    java: {
      skeleton: `// ==========================================
// ELEVATOR CONTROLLER SYSTEM (Java)
// Starting Scaffold: Define state machine and dispatching logic
// ==========================================

import java.util.*;

enum Direction { UP, DOWN, IDLE }
enum ElevatorState { IDLE, MOVING_UP, MOVING_DOWN, DOOR_OPEN, MAINTENANCE }

class ElevatorCar {
    private String id;
    private int currentFloor = 0;
    private Direction direction = Direction.IDLE;
    private ElevatorState state = ElevatorState.IDLE;
    private List<Integer> destinationFloors = new ArrayList<>();

    public ElevatorCar(String id) { this.id = id; }
    public synchronized void addDestination(int floor) { /* TODO */ }
    public synchronized void step() { /* TODO */ }
}

interface DispatchStrategy {
    ElevatorCar selectElevator(List<ElevatorCar> cars, int floor, Direction dir);
}

class ElevatorController {
    private List<ElevatorCar> elevators;
    private DispatchStrategy strategy;

    public ElevatorController(List<ElevatorCar> elevators, DispatchStrategy strategy) {
        this.elevators = elevators;
        this.strategy = strategy;
    }
    public synchronized void handleHallCall(int floor, Direction dir) { /* TODO */ }
}`
    },
    python: {
      skeleton: `# ==========================================
# ELEVATOR CONTROLLER SYSTEM (Python)
# Starting Scaffold: Define state machine and dispatching logic
# ==========================================

from enum import Enum
from abc import ABC, abstractmethod
from typing import List

class Direction(Enum):
    UP = 1
    DOWN = 2
    IDLE = 3

class ElevatorCar:
    def __init__(self, car_id: str):
        self.id = car_id
        self.current_floor = 0
        self.direction = Direction.IDLE
        self.destination_floors: List[int] = []

    def add_destination(self, floor: int) -> None:
        # TODO: Enqueue target floor
        pass

    def step(self) -> None:
        # TODO: Move car and service requests
        pass

class DispatchStrategy(ABC):
    @abstractmethod
    def select_elevator(self, cars: List[ElevatorCar], floor: int, direction: Direction) -> ElevatorCar:
        pass

class ElevatorController:
    def __init__(self, elevators: List[ElevatorCar], strategy: DispatchStrategy):
        self.elevators = elevators
        self.strategy = strategy

    def handle_hall_call(self, floor: int, direction: Direction) -> None:
        # TODO: Dispatch call
        pass`
    }
  },

  'vending-machine': {
    cpp: {
      skeleton: `// ==========================================
// VENDING MACHINE SYSTEM (C++)
// Starting Scaffold: Define state transitions and product inventory
// ==========================================

#include <iostream>
#include <string>
#include <memory>
#include <unordered_map>

class VendingMachine;

class VendingState {
public:
    virtual ~VendingState() = default;
    virtual void insertMoney(VendingMachine& machine, double amount) = 0;
    virtual void selectProduct(VendingMachine& machine, const std::string& code) = 0;
    virtual void dispense(VendingMachine& machine) = 0;
    virtual double cancel(VendingMachine& machine) = 0;
};

class VendingMachine {
private:
    std::shared_ptr<VendingState> currentState;
    double balance = 0.0;
public:
    VendingMachine(std::shared_ptr<VendingState> initial) : currentState(initial) {}
    void setState(std::shared_ptr<VendingState> state) { currentState = state; }
    void insertMoney(double amount) { /* TODO */ }
    void selectProduct(const std::string& code) { /* TODO */ }
};`
    },
    java: {
      skeleton: `// ==========================================
// VENDING MACHINE SYSTEM (Java)
// Starting Scaffold: Define state transitions and product inventory
// ==========================================

import java.util.*;

interface VendingMachineState {
    void insertMoney(VendingMachine machine, double amount);
    void selectProduct(VendingMachine machine, String code);
    void dispense(VendingMachine machine);
    double cancel(VendingMachine machine);
}

class VendingMachine {
    private VendingMachineState currentState;
    private double balance = 0.0;

    public VendingMachine(VendingMachineState initialState) {
        this.currentState = initialState;
    }

    public void setState(VendingMachineState state) {
        this.currentState = state;
    }

    public void insertMoney(double amount) {
        currentState.insertMoney(this, amount);
    }
}`
    },
    python: {
      skeleton: `# ==========================================
# VENDING MACHINE SYSTEM (Python)
# Starting Scaffold: Define state transitions and product inventory
# ==========================================

from abc import ABC, abstractmethod

class VendingMachineState(ABC):
    @abstractmethod
    def insert_money(self, machine: 'VendingMachine', amount: float) -> None:
        pass

    @abstractmethod
    def select_product(self, machine: 'VendingMachine', code: str) -> None:
        pass

    @abstractmethod
    def dispense(self, machine: 'VendingMachine') -> None:
        pass

    @abstractmethod
    def cancel(self, machine: 'VendingMachine') -> float:
        pass

class VendingMachine:
    def __init__(self, initial_state: VendingMachineState):
        self.state = initial_state
        self.balance = 0.0

    def set_state(self, state: VendingMachineState) -> None:
        self.state = state

    def insert_money(self, amount: float) -> None:
        self.state.insert_money(self, amount)`
    }
  },

  'lru-cache': {
    cpp: {
      skeleton: `// ==========================================
// THREAD-SAFE LRU CACHE (C++)
// Starting Scaffold: Define cache storage & pluggable eviction policy
// ==========================================

#include <iostream>
#include <string>
#include <unordered_map>
#include <memory>
#include <mutex>

template<typename K>
class EvictionPolicy {
public:
    virtual ~EvictionPolicy() = default;
    virtual void keyAccessed(const K& key) = 0;
    virtual K evictKey() = 0;
};

template<typename K, typename V>
class Cache {
private:
    size_t capacity;
    std::shared_ptr<EvictionPolicy<K>> policy;
    std::unordered_map<K, V> storage;
    std::mutex mtx;
public:
    Cache(size_t cap, std::shared_ptr<EvictionPolicy<K>> pol)
        : capacity(cap), policy(pol) {}

    bool get(const K& key, V& outVal) {
        // TODO: Thread-safe lookup and notify policy
        return false;
    }

    void put(const K& key, const V& value) {
        // TODO: Thread-safe insert and policy eviction
    }
};`
    },
    java: {
      skeleton: `// ==========================================
// THREAD-SAFE LRU CACHE (Java)
// Starting Scaffold: Define cache storage & pluggable eviction policy
// ==========================================

import java.util.*;

interface EvictionPolicy<K> {
    void keyAccessed(K key);
    K evictKey();
}

class Cache<K, V> {
    private final int capacity;
    private final EvictionPolicy<K> evictionPolicy;
    private final Map<K, V> storage = new HashMap<>();

    public Cache(int capacity, EvictionPolicy<K> evictionPolicy) {
        this.capacity = capacity;
        this.evictionPolicy = evictionPolicy;
    }

    public synchronized V get(K key) {
        // TODO: Return value and notify policy
        return null;
    }

    public synchronized void put(K key, V value) {
        // TODO: Handle insertion and policy eviction
    }
}`
    },
    python: {
      skeleton: `# ==========================================
# THREAD-SAFE LRU CACHE (Python)
# Starting Scaffold: Define cache storage & pluggable eviction policy
# ==========================================

from abc import ABC, abstractmethod
from typing import TypeVar, Generic, Optional, Dict
import threading

K = TypeVar('K')
V = TypeVar('V')

class EvictionPolicy(Generic[K], ABC):
    @abstractmethod
    def key_accessed(self, key: K) -> None:
        pass

    @abstractmethod
    def evict_key(self) -> Optional[K]:
        pass

class Cache(Generic[K, V]):
    def __init__(self, capacity: int, eviction_policy: EvictionPolicy[K]):
        self.capacity = capacity
        self.policy = eviction_policy
        self.storage: Dict[K, V] = {}
        self.lock = threading.Lock()

    def get(self, key: K) -> Optional[V]:
        # TODO: Thread-safe read and notify policy
        return None

    def put(self, key: K, value: V) -> None:
        # TODO: Thread-safe write and handle eviction
        pass`
    }
  }
};
