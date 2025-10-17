-- Userテーブル
CREATE TABLE IF NOT EXISTS User (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customerテーブル
CREATE TABLE IF NOT EXISTS Customer (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  address TEXT,
  status TEXT DEFAULT 'active',
  notes TEXT,
  contractDate DATETIME,
  contractAmount REAL DEFAULT 0,
  contractDetails TEXT,
  industry TEXT,
  employeeCount INTEGER,
  annualRevenue REAL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  userId TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES User(id)
);

-- Contactテーブル
CREATE TABLE IF NOT EXISTS Contact (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT,
  notes TEXT,
  customerId TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customerId) REFERENCES Customer(id)
);

-- Taskテーブル
CREATE TABLE IF NOT EXISTS Task (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'not_started',
  priority TEXT DEFAULT 'medium',
  dueDate DATETIME,
  startDate DATETIME,
  completedAt DATETIME,
  estimatedHours REAL,
  actualHours REAL,
  assignee TEXT,
  category TEXT,
  tags TEXT,
  progress INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  userId TEXT NOT NULL,
  customerId TEXT,
  FOREIGN KEY (userId) REFERENCES User(id),
  FOREIGN KEY (customerId) REFERENCES Customer(id)
);

-- Leadテーブル
CREATE TABLE IF NOT EXISTS Lead (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  source TEXT,
  status TEXT DEFAULT 'new',
  notes TEXT,
  score INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  userId TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES User(id)
);

-- Opportunityテーブル
CREATE TABLE IF NOT EXISTS Opportunity (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  amount REAL,
  stage TEXT DEFAULT 'qualification',
  probability INTEGER DEFAULT 0,
  closeDate DATETIME,
  description TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  userId TEXT NOT NULL,
  customerId TEXT,
  FOREIGN KEY (userId) REFERENCES User(id),
  FOREIGN KEY (customerId) REFERENCES Customer(id)
);