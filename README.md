# 💻 TrackFO Web

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=24&pause=1000&color=36BCF7&center=true&vCenter=true&width=700&lines=TrackFO+Web+Dashboard;Technician+Monitoring+System;FTTH+Disturbance+Management;Admin+%26+Super+Admin+Control+Center" alt="Typing SVG" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white" />
  <img src="https://img.shields.io/badge/OpenStreetMap-7EBC6F?style=for-the-badge&logo=openstreetmap&logoColor=white" />
</p>

---

# 📖 Overview

TrackFO Web merupakan dashboard monitoring berbasis web yang digunakan oleh **Super Admin** dan **Admin** untuk mengelola gangguan jaringan Fiber Optic (FTTH), melakukan assignment teknisi, memantau lokasi teknisi secara real-time, serta menghasilkan laporan operasional.

Dashboard ini menjadi pusat kendali utama dalam ekosistem TrackFO yang menghubungkan administrator dengan teknisi lapangan melalui integrasi langsung ke TrackFO Backend dan aplikasi mobile teknisi.

---

# 🎯 Main Features

## 📊 Dashboard Monitoring

* Total Gangguan
* Gangguan Aktif
* Gangguan Selesai
* Total Teknisi
* Statistik Kinerja
* Monitoring Operasional

---

## 👥 User Management

### Super Admin

* Manage Admin
* Manage Teknisi
* Role Management
* Account Management

### Admin

* Manage Data Gangguan
* Manage Assignment
* Monitoring Teknisi

---

## 🚨 Disturbance Management

* Create Disturbance Report
* Update Disturbance Status
* Search & Filter Disturbance
* Track Resolution Progress

---

## 📋 Assignment Management

* Assign Technician
* Reassign Technician
* Assignment Monitoring
* Assignment History

---

## 📍 Live Technician Tracking

* Real-Time GPS Monitoring
* Technician Last Position
* Technician Status Monitoring
* Interactive Map Visualization

---

## 📄 Reporting

* Work Completion Reports
* Disturbance Reports
* Technician Activity Reports
* Performance Monitoring

---

# 🏗️ System Architecture

```text id="trackfo-web-arch"
                        ┌─────────────────┐
                        │   Super Admin   │
                        └────────┬────────┘
                                 │
                                 ▼
                     ┌─────────────────────┐
                     │    TrackFO Web      │
                     │ React + Leaflet     │
                     └─────────┬───────────┘
                               │
                          REST API
                               │
                               ▼
                     ┌─────────────────────┐
                     │   TrackFO Backend   │
                     │ Express + Prisma    │
                     └─────────┬───────────┘
                               │
                               ▼
                            MySQL
                               ▲
                               │
                     ┌─────────┴───────────┐
                     │  TrackFO Mobile     │
                     │ Technician App      │
                     └─────────────────────┘
```

---

# 🖥️ Dashboard Modules

## Super Admin

### Dashboard

* System Overview
* Statistics Monitoring

### User Management

* Manage Admin
* Manage Technician
* User Access Control

### Gangguan

* View All Disturbances
* Disturbance Monitoring

### Assignment

* Assignment Overview
* Assignment History

### Tracking

* Live Technician Tracking
* Technician Location Monitoring

### Reports

* Operational Reports
* Export Reports

---

## Admin

### Dashboard

* Daily Operations Monitoring

### Gangguan

* Create & Manage Disturbance

### Assignment

* Assign Technician

### Tracking

* Monitor Technician Location

### Reports

* Generate Reports

---

# 🗺️ Live Tracking System

TrackFO Web menggunakan:

* OpenStreetMap
* Leaflet
* Real-Time Location Data
* GPS Coordinates from Mobile App

Fitur tracking memungkinkan administrator memantau lokasi teknisi yang sedang menangani gangguan jaringan secara langsung melalui dashboard.

---

# 🛠️ Tech Stack

| Category         | Technology                                         |
| ---------------- | -------------------------------------------------- |
| Frontend         | React                                              |
| Build Tool       | Vite                                               |
| Styling          | Tailwind CSS                                       |
| Routing          | React Router DOM                                   |
| API Client       | Axios                                              |
| Maps             | Leaflet                                            |
| Map Provider     | OpenStreetMap                                      |
| Authentication   | JWT                                                |
| State Management | React Context / Redux *(sesuaikan dengan project)* |

---

# 📂 Project Structure

```bash id="trackfo-web-structure"
src/
│
├── assets/
│
├── components/
│
├── pages/
│   ├── dashboard/
│   ├── users/
│   ├── gangguan/
│   ├── assignment/
│   ├── tracking/
│   └── reports/
│
├── services/
│
├── routes/
│
├── hooks/
│
├── layouts/
│
└── App.jsx
```

---

# 📸 Screenshots

## Dashboard

```text id="dashboard-placeholder"
Add Dashboard Screenshot Here
```

## Live Tracking

```text id="tracking-placeholder"
Add Tracking Map Screenshot Here
```

## Disturbance Management

```text id="gangguan-placeholder"
Add Disturbance Management Screenshot Here
```

## Assignment Management

```text id="assignment-placeholder"
Add Assignment Screenshot Here
```

---

# ⚙️ Installation

### Clone Repository

```bash id="clone-web"
git clone https://github.com/RifaAmrilSahputra/TrackFO-Web.git

cd TrackFO-Web
```

### Install Dependencies

```bash id="install-web"
npm install
```

### Setup Environment

```env id="env-web"
VITE_API_URL=http://localhost:3000/api
```

### Run Development Server

```bash id="run-web"
npm run dev
```

---

# 📡 Backend Dependency

TrackFO Web memerlukan TrackFO Backend untuk:

* Authentication
* User Management
* Disturbance Management
* Assignment Services
* Tracking Services
* Reporting Services

Backend Repository:

https://github.com/RifaAmrilSahputra/TrackFO-BE

---

# 🔗 TrackFO Ecosystem

## 💻 TrackFO Web

Dashboard untuk Admin dan Super Admin.

Repository:

https://github.com/RifaAmrilSahputra/TrackFO-Web

---

## 📱 TrackFO Mobile

Aplikasi Android untuk Teknisi Lapangan.

Repository:

https://github.com/RifaAmrilSahputra/TrackFO-Mobile

Features:

* GPS Tracking
* Task Management
* Work History
* Technician Profile

---

## ⚙️ TrackFO Backend

REST API dan Business Logic Layer.

Repository:

https://github.com/RifaAmrilSahputra/TrackFO-BE

Features:

* Authentication
* Assignment Logic
* Tracking Services
* Reporting Services
* Database Management

---

# 🚀 Roadmap

* [x] Authentication
* [x] Dashboard
* [x] User Management
* [x] Disturbance Management
* [x] Assignment Management
* [x] Technician Tracking
* [x] Reporting Module
* [ ] Real-Time WebSocket Tracking
* [ ] Push Notification Center
* [ ] Analytics Dashboard
* [ ] PDF Export System

---

# 👨‍💻 Developer

### Amril Nadapdap

GitHub:
https://github.com/RifaAmrilSahputra

LinkedIn:
https://linkedin.com/in/rifaamrilsahputra

---

⭐ If you find this project useful, consider giving it a star.
