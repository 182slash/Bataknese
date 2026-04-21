-- Drop existing tables if they exist
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;
DROP TABLE IF EXISTS community_members CASCADE;
DROP TABLE IF EXISTS communities CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS marga_reference CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Marga Reference Table
CREATE TABLE marga_reference (
    id SERIAL PRIMARY KEY,
    marga_name VARCHAR(100) NOT NULL UNIQUE,
    sub_ethnic VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    marga VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    date_of_birth DATE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    avatar VARCHAR(255),
    batak_id_card VARCHAR(20) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Communities Table
CREATE TABLE communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    avatar VARCHAR(255),
    city VARCHAR(100),
    province VARCHAR(100),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Community Members Table with Roles
CREATE TABLE community_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'vice_leader', 'secretary', 'treasurer', 'supervisor', 'member')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(community_id, user_id)
);

-- Chat Rooms Table
CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_type VARCHAR(20) NOT NULL CHECK (room_type IN ('community', 'direct')),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    participant_1 UUID REFERENCES users(id) ON DELETE CASCADE,
    participant_2 UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        (room_type = 'community' AND community_id IS NOT NULL AND participant_1 IS NULL AND participant_2 IS NULL) OR
        (room_type = 'direct' AND community_id IS NULL AND participant_1 IS NOT NULL AND participant_2 IS NOT NULL)
    ),
    UNIQUE(community_id),
    UNIQUE(participant_1, participant_2)
);

-- Chat Messages Table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image')),
    content TEXT,
    image_url VARCHAR(255),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        (message_type = 'text' AND content IS NOT NULL) OR
        (message_type = 'image' AND image_url IS NOT NULL)
    )
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_marga ON users(marga);
CREATE INDEX idx_users_city ON users(city);
CREATE INDEX idx_users_province ON users(province);
CREATE INDEX idx_users_batak_id ON users(batak_id_card);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

CREATE INDEX idx_communities_created_by ON communities(created_by);
CREATE INDEX idx_communities_city ON communities(city);
CREATE INDEX idx_communities_province ON communities(province);

CREATE INDEX idx_community_members_community ON community_members(community_id);
CREATE INDEX idx_community_members_user ON community_members(user_id);
CREATE INDEX idx_community_members_role ON community_members(role);

CREATE INDEX idx_chat_rooms_type ON chat_rooms(room_type);
CREATE INDEX idx_chat_rooms_community ON chat_rooms(community_id);
CREATE INDEX idx_chat_rooms_participant1 ON chat_rooms(participant_1);
CREATE INDEX idx_chat_rooms_participant2 ON chat_rooms(participant_2);

CREATE INDEX idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_is_read ON chat_messages(is_read);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON communities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate Batak ID Card number
CREATE OR REPLACE FUNCTION generate_batak_id()
RETURNS VARCHAR(20) AS $$
DECLARE
    year_part VARCHAR(4);
    sequence_part VARCHAR(5);
    new_id VARCHAR(20);
    max_sequence INTEGER;
BEGIN
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    -- Get the maximum sequence number for current year
    SELECT COALESCE(MAX(CAST(SUBSTRING(batak_id_card FROM 10) AS INTEGER)), 0)
    INTO max_sequence
    FROM users
    WHERE batak_id_card LIKE 'BTC-' || year_part || '-%';
    
    sequence_part := LPAD((max_sequence + 1)::TEXT, 5, '0');
    new_id := 'BTC-' || year_part || '-' || sequence_part;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate Batak ID on insert
CREATE OR REPLACE FUNCTION set_batak_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.batak_id_card IS NULL OR NEW.batak_id_card = '' THEN
        NEW.batak_id_card := generate_batak_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate Batak ID
CREATE TRIGGER trigger_set_batak_id
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_batak_id();

-- Function to auto-create community chat room
CREATE OR REPLACE FUNCTION create_community_chat_room()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO chat_rooms (room_type, community_id)
    VALUES ('community', NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create chat room when community is created
CREATE TRIGGER trigger_create_community_chat
    AFTER INSERT ON communities
    FOR EACH ROW
    EXECUTE FUNCTION create_community_chat_room();

-- Function to auto-add creator as leader
CREATE OR REPLACE FUNCTION add_creator_as_leader()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO community_members (community_id, user_id, role)
    VALUES (NEW.id, NEW.created_by, 'leader');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to add creator as leader
CREATE TRIGGER trigger_add_creator_as_leader
    AFTER INSERT ON communities
    FOR EACH ROW
    EXECUTE FUNCTION add_creator_as_leader();

-- Seed Marga Reference Data (50+ Batak Marga from all sub-ethnics)
INSERT INTO marga_reference (marga_name, sub_ethnic) VALUES
-- Toba
('Siregar', 'Toba'),
('Situmorang', 'Toba'),
('Simatupang', 'Toba'),
('Hutabarat', 'Toba'),
('Panggabean', 'Toba'),
('Simanjuntak', 'Toba'),
('Siahaan', 'Toba'),
('Napitupulu', 'Toba'),
('Hutapea', 'Toba'),
('Manurung', 'Toba'),
('Lumbantobing', 'Toba'),
('Simbolon', 'Toba'),
('Sirait', 'Toba'),
('Hutauruk', 'Toba'),
('Sitorus', 'Toba'),
('Nababan', 'Toba'),
('Pardede', 'Toba'),
('Pandiangan', 'Toba'),
('Sihombing', 'Toba'),
('Pasaribu', 'Toba'),

-- Karo
('Ginting', 'Karo'),
('Sembiring', 'Karo'),
('Tarigan', 'Karo'),
('Karo-Karo', 'Karo'),
('Perangin-angin', 'Karo'),
('Barus', 'Karo'),
('Sinulingga', 'Karo'),
('Sinukaban', 'Karo'),
('Sinuraya', 'Karo'),
('Sinuhaji', 'Karo'),

-- Simalungun
('Saragih', 'Simalungun'),
('Sinaga', 'Simalungun'),
('Purba', 'Simalungun'),
('Damanik', 'Simalungun'),
('Girsang', 'Simalungun'),
('Marpaung', 'Simalungun'),
('Sidabutar', 'Simalungun'),
('Sidauruk', 'Simalungun'),
('Sinambela', 'Simalungun'),
('Tampubolon', 'Simalungun'),

-- Pakpak
('Banurea', 'Pakpak'),
('Marusaha', 'Pakpak'),
('Boang-Manalu', 'Pakpak'),
('Ujung', 'Pakpak'),
('Solin', 'Pakpak'),
('Manik', 'Pakpak'),
('Tumanggor', 'Pakpak'),

-- Mandailing
('Lubis', 'Mandailing'),
('Nasution', 'Mandailing'),
('Rangkuti', 'Mandailing'),
('Hasibuan', 'Mandailing'),
('Daulay', 'Mandailing'),
('Harahap', 'Mandailing'),
('Pulungan', 'Mandailing'),
('Rambe', 'Mandailing'),
('Batubara', 'Mandailing'),

-- Angkola
('Siregar', 'Angkola'),
('Harahap', 'Angkola'),
('Dalimunthe', 'Angkola'),
('Matondang', 'Angkola'),
('Pohan', 'Angkola'),
('Pane', 'Angkola'),
('Tanjung', 'Angkola');

-- Create view for user directory search
CREATE OR REPLACE VIEW user_directory AS
SELECT 
    u.id,
    u.full_name,
    u.marga,
    u.email,
    u.gender,
    u.date_of_birth,
    EXTRACT(YEAR FROM AGE(u.date_of_birth)) AS age,
    u.phone,
    u.city,
    u.province,
    u.avatar,
    u.batak_id_card,
    u.created_at
FROM users u
WHERE u.is_active = true;
