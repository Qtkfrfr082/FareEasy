FareEasy

FareEasy is a simple fare calculator app designed for students and commuters.
It helps users estimate transportation costs by inputting their route and viewing available fare options.

📦 Table of Contents

Features

Tech Stack

Getting Started

Project Structure

Usage

Future Improvements

Contributing

License

🔍 Features

Calculate estimated fares for daily commutes

Support for multiple transport modes (jeepney, tricycle, bus, walking, etc.)

Simple and user-friendly UI for students and everyday commuters

Built with mobile users in mind (responsive design)

🛠 Tech Stack
Layer	Tools / Libraries
Framework	React Native (with Expo)
Styling	NativeWind (Tailwind for React Native)
Maps / Routes	Google Maps Directions API
Language	TypeScript / JavaScript
🚀 Getting Started

Clone the repo:

git clone https://github.com/Qtkfrfr082/FareEasy.git
cd FareEasy


Install dependencies:

npm install
# or
yarn install


Start the app (Expo):

npm run start


Open in Expo Go (on Android/iOS) or emulator.

🧩 Project Structure
FareEasy/
├── app/                  # Screens & components
├── assets/               # Images, icons
├── utils/                # Fare calculation & directions logic
├── App.tsx               # App entry
├── tailwind.config.js    # NativeWind/Tailwind config
├── package.json
└── tsconfig.json

🧰 Usage

Enter your origin and destination

View suggested routes with transportation breakdown

See fare estimates for each mode of transport

Toggle options (like replacing bus with jeepney, or walking with tricycle)

🔭 Future Improvements

Save frequent routes for quick access

Multi-currency or fare adjustments

Offline mode for saved routes

Enhanced UI/UX with animations

🤝 Contributing

Fork the repo

Create a feature branch (git checkout -b feature/YourFeature)

Commit your changes

Push and submit a Pull Request
