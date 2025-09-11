-- Database setup for University Evaluation System

-- 1. Create dimensions table
CREATE TABLE dimensions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert the 3 dimensions
INSERT INTO dimensions (name, code, description) VALUES 
('Governance', 'governance', 'Governance dimension evaluation'),
('Social', 'social', 'Social dimension evaluation'),
('Environmental', 'environmental', 'Environmental dimension evaluation');

-- 2. Create questions table
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    dimension_id INTEGER REFERENCES dimensions(id),
    text TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    scale_descriptions JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample questions for Governance dimension
INSERT INTO questions (dimension_id, text, order_index, scale_descriptions) VALUES 
(1, 'How would you rate the university''s governance transparency?', 1, '{"1": "Very poor transparency", "2": "Poor transparency", "3": "Fair transparency", "4": "Good transparency", "5": "Excellent transparency"}'),
(1, 'How effective is the university''s decision-making process?', 2, '{"1": "Very ineffective", "2": "Ineffective", "3": "Somewhat effective", "4": "Effective", "5": "Very effective"}'),
(1, 'How would you rate the university''s accountability mechanisms?', 3, '{"1": "Very poor", "2": "Poor", "3": "Fair", "4": "Good", "5": "Excellent"}'),
(1, 'How well does the university manage conflicts of interest?', 4, '{"1": "Very poorly", "2": "Poorly", "3": "Adequately", "4": "Well", "5": "Very well"}'),
(1, 'How accessible is information about university policies and procedures?', 5, '{"1": "Not accessible", "2": "Barely accessible", "3": "Somewhat accessible", "4": "Accessible", "5": "Very accessible"}');

-- Insert sample questions for Social dimension
INSERT INTO questions (dimension_id, text, order_index, scale_descriptions) VALUES 
(2, 'How inclusive is the university''s admission process?', 1, '{"1": "Not inclusive", "2": "Slightly inclusive", "3": "Moderately inclusive", "4": "Very inclusive", "5": "Extremely inclusive"}'),
(2, 'How well does the university support student diversity?', 2, '{"1": "Very poor support", "2": "Poor support", "3": "Fair support", "4": "Good support", "5": "Excellent support"}'),
(2, 'How effective are the university''s community engagement programs?', 3, '{"1": "Very ineffective", "2": "Ineffective", "3": "Somewhat effective", "4": "Effective", "5": "Very effective"}'),
(2, 'How well does the university address social equity issues?', 4, '{"1": "Very poorly", "2": "Poorly", "3": "Adequately", "4": "Well", "5": "Very well"}'),
(2, 'How accessible are university facilities and services?', 5, '{"1": "Not accessible", "2": "Barely accessible", "3": "Somewhat accessible", "4": "Accessible", "5": "Very accessible"}');

-- Insert sample questions for Environmental dimension
INSERT INTO questions (dimension_id, text, order_index, scale_descriptions) VALUES 
(3, 'How sustainable are the university''s energy practices?', 1, '{"1": "Not sustainable", "2": "Slightly sustainable", "3": "Moderately sustainable", "4": "Very sustainable", "5": "Extremely sustainable"}'),
(3, 'How effective is the university''s waste management system?', 2, '{"1": "Very ineffective", "2": "Ineffective", "3": "Somewhat effective", "4": "Effective", "5": "Very effective"}'),
(3, 'How well does the university promote environmental awareness?', 3, '{"1": "Very poorly", "2": "Poorly", "3": "Adequately", "4": "Well", "5": "Very well"}'),
(3, 'How sustainable are the university''s transportation options?', 4, '{"1": "Not sustainable", "2": "Slightly sustainable", "3": "Moderately sustainable", "4": "Very sustainable", "5": "Extremely sustainable"}'),
(3, 'How environmentally friendly are the university''s building practices?', 5, '{"1": "Not eco-friendly", "2": "Slightly eco-friendly", "3": "Moderately eco-friendly", "4": "Very eco-friendly", "5": "Extremely eco-friendly"}');

-- 3. Create evaluations table
CREATE TABLE evaluations (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    university_id INTEGER REFERENCES universities(id),
    dimension_id INTEGER REFERENCES dimensions(id),
    comments TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, university_id, dimension_id)
);

-- 4. Create evaluation responses table
CREATE TABLE evaluation_responses (
    id SERIAL PRIMARY KEY,
    evaluation_id INTEGER REFERENCES evaluations(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id),
    score INTEGER CHECK (score >= 1 AND score <= 5),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(evaluation_id, question_id)
);

-- Optional: Insert sample universities if they don't exist
-- INSERT INTO universities (name, city, department) VALUES 
-- ('Universidad Nacional de Colombia', 'Bogotá', 'Cundinamarca'),
-- ('Universidad de Antioquia', 'Medellín', 'Antioquia'),
-- ('Universidad del Valle', 'Cali', 'Valle del Cauca');