# 🏠 RentEase

> A full-stack real estate application built with **React + TypeScript + Vite**, featuring authentication, property management, and image hosting with **Firebase** and **Cloudinary**.

---

## ✨ Features
- 🔑 User authentication (Firebase Auth)
- 🏘️ Create, edit, and delete property listings
- 📸 Image upload with **Cloudinary**
- 🔎 Search & filters (city, price, surface, type…)
- 📊 Form validation with **Yup + React Hook Form**
- 📱 Responsive design (TailwindCSS)

---

## 🖼️ Screenshots

| ![Menu](https://github.com/loanlvn/RentEase-React/blob/main/menuS1.png?raw=true) | ![Admin Panel](https://github.com/loanlvn/RentEase-React/blob/main/AdminPanelS2.png?raw=true) | ![Login](https://github.com/loanlvn/RentEase-React/blob/main/LoginS3.png?raw=true) |
| --- | --- | --- |
| ![Register](https://github.com/loanlvn/RentEase-React/blob/main/RegisterS3.png?raw=true) | ![New Flat Step](https://github.com/loanlvn/RentEase-React/blob/main/NewFlatStepInfoS4.png?raw=true) | ![Firestore](https://github.com/loanlvn/RentEase-React/blob/main/fireStoreS5.png?raw=true) |

---

## 🏗️ Tech Stack
- **Frontend**: React, TypeScript, Vite, TailwindCSS  
- **Backend / Database**: Firebase (Firestore)  
- **Media Hosting**: Cloudinary (Firebase Storage is not free so I had to switch with Cloudinary)  
- **Forms**: React Hook Form + Yup  
- **Other tools**: GitHub Actions (CI/CD), ESLint, Prettier  

---

## 🚀 Getting Started
Clone the repo and install dependencies:
```bash
git clone https://github.com/loanvn/rentease.git
cd rentease
pnpm install
```
## 🔧 Architecture Overview

```mermaid
flowchart TD
  UI[React + Vite + Tailwind] --> RHF[React Hook Form + Yup]
  UI --> Router[React Router]
  UI --> Store[Context/Zustand]
  Store --> Firestore[(Firebase Firestore)]
  UI --> Cloudinary[(Cloudinary Media Storage)]
  Firestore --> Rules[Firestore Security Rules]
  Auth[Firebase Auth] --> UI
