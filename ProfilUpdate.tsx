/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import ReusableForm from "../../../components/ReusableForm";
import ButtonMotion from "../../../components/ButtonMotion";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { db } from "../../../services/firebaseConfig";
import FullPageLoader from "../../../components/FullPageLoader";

// Regex validators
const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*\W).{6,}$/;
function isAdult(birth: string): boolean {
  const d = new Date(birth);
  const age = new Date().getFullYear() - d.getFullYear();
  return (
    age > 18 ||
    (age === 18 &&
      (new Date().getMonth() > d.getMonth() ||
        (new Date().getMonth() === d.getMonth() &&
          new Date().getDate() >= d.getDate())))
  );
}

export default function ProfileUpdate() {
  const navigate = useNavigate();
  const {
    currentUser,
    userProfile,
    loading: authLoading,
    loadingProfile,
    
    logout,
    updateUserProfile,
  } = useAuth();

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reauth, setReauth] = useState(false);
  const [reauthPass, setReauthPass] = useState("");

  useEffect(() => {
    if (authLoading || loadingProfile) return;
    if (!currentUser || !userProfile) {
      navigate("/login", { replace: true });
      return;
    }
    setFirstName(userProfile.firstName);
    setLastName(userProfile.lastName);
    setBirthDate(userProfile.birthDate);
    setEmail(userProfile.email);
  }, [authLoading, loadingProfile, currentUser, userProfile, navigate]);

  const fields = [
    {
      label: "First Name",
      name: "firstName",
      type: "text",
      value: firstName,
      onChange: (e: any) => setFirstName(e.target.value),
    },
    {
      label: "Last Name",
      name: "lastName",
      type: "text",
      value: lastName,
      onChange: (e: any) => setLastName(e.target.value),
    },
    {
      label: "Birth Date",
      name: "birthDate",
      type: "date",
      value: birthDate,
      onChange: (e: any) => setBirthDate(e.target.value),
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      value: email,
      onChange: (e: any) => setEmail(e.target.value),
    },
    {
      label: "New Password",
      name: "password",
      type: "password",
      value: password,
      onChange: (e: any) => setPassword(e.target.value),
    },
    {
      label: "Confirm Password",
      name: "confirm",
      type: "password",
      value: confirm,
      onChange: (e: any) => setConfirm(e.target.value),
    },
  ];

  // handle profile update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setError(null);

    // validation
    if (!firstName || !lastName || !birthDate || !email) {
      setError("All fields except password are required.");
      return;
    }
    if (firstName.length < 2 || lastName.length < 2) {
      setError("First and last name must be at least 2 characters long.");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Invalid email address.");
      return;
    }
    if (!isAdult(birthDate)) {
      setError("You must be at least 18 years old.");
      return;
    }
    if (
      (password || confirm) &&
      (!passwordRegex.test(password) || password !== confirm)
    ) {
      setError(
        "Passwords must match and include letters, numbers, and special characters."
      );
      return;
    }

    try {
      setSaving(true);
      await updateUserProfile({
        firstName,
        lastName,
        birthDate,
        email,
        newPassword: password || undefined,
      });
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // handle account deletion (with related data)
  const handleDelete = async () => {
    if (!currentUser) return;
    if (
      !window.confirm(
        "Please confirm you want to permanently delete your account and all data."
      )
    )
      return;

    try {
      setDeleting(true);
      const userId = currentUser.uid;

      // delete all Flats owned by the user
      try {
        const flatsQuery = query(
          collection(db, "Flats"),
          where("ownerId", "==", userId)
        );
        const flatsSnapshot = await getDocs(flatsQuery);

        for (const flatDoc of flatsSnapshot.docs) {
          const flatId = flatDoc.id;

          // delete conversation messages
          try {
            const messagesQuery = collection(
              db,
              "Conversations",
              flatId,
              "Messages"
            );
            const messagesSnapshot = await getDocs(messagesQuery);
            for (const messageDoc of messagesSnapshot.docs) {
              await deleteDoc(messageDoc.ref);
            }
          } catch {
            /* ignore message deletion errors */
          }

          // delete the flat itself
          await deleteDoc(flatDoc.ref);
        }
      } catch {
        /* ignore flats deletion errors */
      }

      // delete MyFlats entries
      try {
        const myFlatsQuery = collection(db, "MyFlats", userId, "Flats");
        const myFlatsSnapshot = await getDocs(myFlatsQuery);
        for (const myFlatDoc of myFlatsSnapshot.docs) {
          await deleteDoc(myFlatDoc.ref);
        }
      } catch {
        /* ignore MyFlats deletion errors */
      }

      // delete the user’s Favorites
      try {
        const favoritesQuery = collection(
          db,
          "users",
          userId,
          "Favorites"
        );
        const favoritesSnapshot = await getDocs(favoritesQuery);
        for (const favDoc of favoritesSnapshot.docs) {
          await deleteDoc(favDoc.ref);
        }
      } catch {
        /* ignore favorites deletion errors */
      }

      // delete messages sent by this user in any conversation
      try {
        const allFlatsSnapshot = await getDocs(collection(db, "Flats"));
        for (const flatDoc of allFlatsSnapshot.docs) {
          const flatId = flatDoc.id;
          const messagesQuery = collection(
            db,
            "Conversations",
            flatId,
            "Messages"
          );
          const messagesSnapshot = await getDocs(messagesQuery);
          for (const messageDoc of messagesSnapshot.docs) {
            const msg = messageDoc.data();
            if (msg.senderId === userId) {
              await deleteDoc(messageDoc.ref);
            }
          }
        }
      } catch {
        /* ignore cross-conversation deletion errors */
      }

      // delete the user profile document
      try {
        await deleteDoc(doc(db, "users", userId));
      } catch {
        /* ignore profile deletion errors */
      }

      // delete the Firebase Auth user
      await deleteUser(currentUser);

      // log out and redirect home
      await logout();
      navigate("/", { replace: true });
    } catch (err: any) {
      console.error("Deletion error:", err);
      if (err.code === "auth/requires-recent-login") {
        setReauth(true);
      } else {
        setError(`Deletion failed: ${err.message}`);
      }
    } finally {
      setDeleting(false);
    }
  };

  // re-authentication form if needed
  const handleReauth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setError(null);

    try {
      const cred = EmailAuthProvider.credential(
        currentUser.email!,
        reauthPass
      );
      await reauthenticateWithCredential(currentUser, cred);
      setReauth(false);
      setReauthPass("");
      handleDelete();
    } catch {
      setError("Re-authentication failed. Please check your password.");
    }
  };

  if (authLoading || loadingProfile) return <FullPageLoader />

  if (reauth) {
    return (
      <div className="max-w-md mx-auto p-6">
        <p className="mb-4 text-red-600">
          You must re-authenticate to delete your account.
        </p>
        <form onSubmit={handleReauth}>
          <label className="block mb-2">Email: {currentUser?.email}</label>
          <input
            type="password"
            placeholder="Current password"
            value={reauthPass}
            onChange={(e) => setReauthPass(e.target.value)}
            required
            className="w-full p-2 border mb-4"
          />
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex gap-2">
            <ButtonMotion
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Confirm
            </ButtonMotion>
            <ButtonMotion
              type="button"
              onClick={() => setReauth(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </ButtonMotion>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <ReusableForm
        title="Update Profile"
        fields={fields}
        onSubmit={handleUpdate}
        submitText="Save Changes"
        loading={saving}
      />
      <div className="mt-6 border-t pt-4">
        <ButtonMotion
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 w-full bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete My Account"}
        </ButtonMotion>
      </div>
    </div>
  );
}
