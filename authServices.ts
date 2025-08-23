import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../../src/services/firebaseConfig";


export const registerUser = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    birthDate: string
): Promise<User> => {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    if (!userCred.user) throw new Error("Failed to create user");

    await updateProfile(userCred.user, {
        displayName: `${firstName} ${lastName}`,
    });

    await setDoc(doc(db, "users", userCred.user.uid), {
        uid: userCred.user.uid,
        firstName,
        lastName,
        birthDate,
        email,
        createdAt: new Date().toISOString(),
        isAdmin: false,
    });

    return userCred.user;
};


export const loginUser = async (
    email: string,
    password: string
): Promise<User> => {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    return userCred.user;
};


export const signInWithGoogle = async (): Promise<User> => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    await setDoc(
        doc(db, "users", user.uid),
        {   
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: new Date().toISOString(),
            isAdmin: false,
        },
        { merge: true }
    );

    return user;
};
