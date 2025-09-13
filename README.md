# WhatsApp Clone - React Native with Expo & TypeScript

A fully functional WhatsApp clone built with React Native, Expo, and TypeScript. This project includes all the essential features of a modern messaging app with a clean, intuitive UI.

## 🚀 Features

### ✅ Implemented Features

- **Chat List**: Display all conversations with unread counts
- **Individual Chat**: Send and receive messages in real-time
- **Message Status**: Sent, delivered, and read indicators
- **Online Status**: See who's online
- **Search**: Search through chats and contacts
- **Status Updates**: View and manage status updates
- **Call History**: View recent calls with call/video buttons
- **Settings**: User profile and app settings
- **Responsive Design**: Optimized for mobile devices
- **TypeScript**: Full type safety and better development experience

### 🔄 Coming Soon (Ready for Firebase Integration)

- Real user authentication
- Real-time messaging with Firebase
- Image and file sharing
- Push notifications
- Group chats
- Voice messages
- Video/Audio calls

## 📱 Screenshots

The app includes:

- **Main Chat Screen**: Clean list of conversations
- **Individual Chat**: WhatsApp-style message bubbles
- **Status Screen**: Story-like status updates
- **Calls Screen**: Call history with action buttons
- **Settings Screen**: User profile and app settings

## 🛠 Tech Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build tools
- **TypeScript**: Static type checking
- **React Navigation**: Screen navigation
- **Expo Vector Icons**: Beautiful icons
- **Mock Data**: Simulated real-time messaging for demo

## 📋 Project Structure

```
whatsapp-clone/
├── App.tsx                          # Main app component
├── src/
│   ├── components/                  # Reusable components
│   │   ├── ChatItem.tsx            # Chat list item
│   │   └── MessageBubble.tsx       # Message display
│   ├── screens/                     # Screen components
│   │   ├── ChatsScreen.tsx         # Main chat list
│   │   ├── ChatScreen.tsx          # Individual chat
│   │   ├── StatusScreen.tsx        # Status updates
│   │   ├── CallsScreen.tsx         # Call history
│   │   ├── ContactInfoScreen.tsx   # Contact details
│   │   └── SettingsScreen.tsx      # App settings
│   ├── navigation/                  # Navigation setup
│   │   └── MainTabNavigator.tsx    # Bottom tab navigation
│   ├── types/                       # TypeScript definitions
│   │   └── index.ts                # App-wide types
│   ├── constants/                   # App constants
│   │   └── Colors.ts               # Color scheme
│   ├── utils/                       # Utility functions
│   │   └── helpers.ts              # Helper functions
│   └── data/                        # Mock data
│       └── mockData.ts             # Sample users, chats, messages
├── package.json                     # Dependencies
├── app.json                         # Expo configuration
└── tsconfig.json                    # TypeScript configuration
```

## 🚀 Getting Started in CodeSandbox

### Method 1: Using CodeSandbox Templates

1. Go to [CodeSandbox.io](https://codesandbox.io)
2. Click "Create Sandbox"
3. Choose "React Native" template
4. Copy all the files from this project into your sandbox
5. The app will automatically start running

### Method 2: Import from GitHub

1. Create a new repository with all these files
2. In CodeSandbox, click "Import from GitHub"
3. Enter your repository URL
4. CodeSandbox will automatically set up the environment

### Method 3: Manual Setup

1. Create a new React Native sandbox
2. Replace the default `package.json` with the one provided
3. Copy all source files to their respective directories
4. The app will build and run automatically

## 📱 Running on Mobile Device

### Using Expo Go App

1. Install Expo Go from App Store/Google Play
2. In CodeSandbox, click the "Open in Expo" button
3. Scan the QR code with your phone
4. The app will load on your device

### Using Browser Preview

- The app also works in browser preview mode
- Click the browser tab in CodeSandbox to see the web version

## 🔧 Development Commands

```bash
# Install dependencies (auto-handled in CodeSandbox)
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

## 📊 Key Components Explained

### App.tsx

Main application component with navigation setup and screen routing.

### ChatsScreen.tsx

- Displays list of all conversations
- Search functionality
- Unread message counts
- Online status indicators

### ChatScreen.tsx

- Individual chat interface
- Message sending/receiving
- Message status indicators
- Auto-scroll to new messages

### MessageBubble.tsx

- WhatsApp-style message bubbles
- Sent/received styling
- Timestamp and status indicators

### Mock Data System

- Simulates real users and conversations
- Auto-replies for demo purposes
- Realistic message timing

## 🎨 Customization

### Colors

Edit `src/constants/Colors.ts` to change the app's color scheme:

```typescript
export const Colors = {
  primary: "#075e54", // WhatsApp green
  secondary: "#25d366", // Light green
  accent: "#dcf8c6", // Message bubble green
  // ... more colors
};
```

### Mock Data

Edit `src/data/mockData.ts` to customize:

- User profiles
- Sample messages
- Chat history
- Contact list

## 🔄 Next Steps: Firebase Integration

To make this a fully functional messaging app, integrate Firebase:

1. **Firebase Auth**: User registration/login
2. **Firestore**: Real-time message storage
3. **Firebase Storage**: Image/file uploads
4. **Cloud Messaging**: Push notifications
5. **Cloud Functions**: Server-side logic

## 🐛 Troubleshooting

### Common Issues in CodeSandbox

1. **Dependencies not loading**: Restart the sandbox
2. **Type errors**: Check TypeScript configuration
3. **Navigation issues**: Ensure all screens are properly imported
4. **Icons not showing**: Verify @expo/vector-icons is installed

### Performance Tips

- Messages are paginated in the mock system
- Images are optimized for mobile
- Smooth animations throughout the app

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues and pull requests to improve the app!

## ⭐ Features Roadmap

- [ ] Firebase integration
- [ ] Image/video messaging
- [ ] Voice messages
- [ ] Group chat management
- [ ] End-to-end encryption
- [ ] Desktop companion app
- [ ] Advanced search
- [ ] Message reactions
- [ ] Stories/Status with media
- [ ] Dark mode support

---

## 📞 Support

If you need help setting up the project in CodeSandbox or have any questions, feel free to reach out!

**Happy Coding! 🚀**
