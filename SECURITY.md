rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // utils
    function isAuth() {
      return request.auth != null;
    }
    function isAdmin() {
      return isAuth() && request.auth.uid == "2VUmFYgHvgTzwyqfm5YLVAYLsWZ2";
    }

    // 1) Global flats
    match /Flats/{flatId} {
      allow read: if true;
      allow create: if isAuth()
                    && (request.auth.uid == request.resource.data.ownerId || isAdmin());
      allow update, delete: if isAuth()
                            && (resource.data.ownerId == request.auth.uid || isAdmin());
    }

    // 2) Per-user copies “MyFlats”
    match /MyFlats/{userId}/Flats/{flatId} {
      allow read, create, update, delete:
        if isAuth() && (request.auth.uid == userId || isAdmin());
    }

    // 3) Conversations parent node
    match /Conversations/{flatId} {
      allow read: if isAuth();
    }

    // 4) Messages in a conversation
    match /Conversations/{flatId}/Messages/{messageId} {
      allow read: if isAuth();
      allow create: if isAuth();
      allow delete: if isAuth() &&
        (request.auth.uid == resource.data.senderId || isAdmin());
    }

    // 5) Favorites
    match /users/{userId}/Favorites/{favoriteId} {
      allow read, create, update, delete:
        if isAuth() && request.auth.uid == userId;
    }

    // 6) User profiles
    match /users/{userId} {
      // Anyone can read name/email; only owner or admin can write
      allow read: if true;
      allow update, delete:
        if isAuth() && (request.auth.uid == userId || isAdmin());
      allow create:
        if isAuth() && request.auth.uid == userId;
    }

    // 7) Everything else is denied
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
