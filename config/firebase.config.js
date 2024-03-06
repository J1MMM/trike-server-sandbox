const { initializeApp } = require("firebase/app")
const { getStorage } = require("firebase/storage")


const config = {
    firebaseConfig: {
        apiKey: "AIzaSyCrVLewxPB-_FNuYx2dtlxDOPwPZ9ktHEo",
        authDomain: "playground-e2b17.firebaseapp.com",
        databaseURL: "https://playground-e2b17-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "playground-e2b17",
        storageBucket: "playground-e2b17.appspot.com",
        messagingSenderId: "402020060678",
        appId: "1:402020060678:web:019dfb1f8b9e2099ca7d87",
        measurementId: "G-MT1NCSXFY9"
    }
}

initializeApp(config.firebaseConfig)
const storage = getStorage()

module.exports = { storage }




