// src/types/index.ts

// --- ACCOUNTS ---
export interface IUser {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    middle_name: string;
    position: string;
    is_dorm_manager: boolean;
    is_checkpoint_officer: boolean;
    is_carpet_admin: boolean;
    is_active: boolean;
}

// --- CARPETS ---
export interface ICarpet {
    id: number;
    design: string;
    color: string;
    palette: string;
    size: string;
    extra: string;
    image: string;
    image_url: string;
}

// --- CHECKPOINT ---
export interface IVehiclePhoto {
    id: number;
    image: string;
}

export interface IVehicleDocument {
    id: number;
    file: string;
}

export interface IVehicleRecord {
    id: number;
    car_number: string;
    car_brand: string;
    driver_name: string;
    organization?: string;
    entry_time: string;
    exit_time: string | null;
    photos: { id: number; image: string }[];
    documents: { id: number; file: string }[];
}

// --- DORMITORY ---

export interface ITariff {
    id: number;
    service_name: string;
    label: string;
    value: number;
    unit: string;
}

export interface IMonthlyPayment {
    id: number;
    month: number;
    land_tax: number;
    rent_payment: number;
    capital_repair: number;
    maintenance: number;
    heating: number;
    water_sewage: number;
    water_heating: number;
    electricity: number;
    elevator_maintenance: number;
    elevator_electricity: number;
    waste_management: number;
    dog_tax: number;
    common_lighting: number;
    common_sanitation: number;
    recalculation: number;
    total?: number;
}

export interface IResidentCard {
    id: number;
    full_name: string;
    account_number: string;
    year: number;
    room_number: string;
    total_area: number;
    living_area: number;
    family_count: number;
    dog_count: number;
    payments?: IMonthlyPayment[];
}
