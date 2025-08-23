import { db } from "../../../../services/firebaseConfig";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import type { FlatData } from "../../../../types/NewFlatsFormType";
import { uploadToCloudinary } from "../../../../services/cloudinaryUpload";

export async function submitNewFlat(data: FlatData, userId: string) {
  const imageUrls: string[] = [];
  for (const file of data.images) {
    const url = await uploadToCloudinary(file);
    imageUrls.push(url);
  }

  const finalData = {
    ownerId: userId,
    userId: userId,
    mode: data.mode,
    type: data.type,
    title: data.title,
    city: data.city,
    address: data.address,
    surface: data.surface,
    rooms: data.rooms,
    furnished: data.furnished,
    airConditioned: data.airConditioned,
    constructionYear: data.constructionYear,
    dpe: data.dpe,
    notSubjectToDpe: data.notSubjectToDpe,
    emission: data.emission,
    emissionConsumption: data.emissionConsumption,
    consumption: data.consumption,
    images: imageUrls,
    description: data.description,
    price: data.price,
    charges: data.charges,
    createdAt: Timestamp.now(),
  };

  const flatsCol = collection(db, "Flats");
  const flatsRef = doc(flatsCol);
  const flatId   = flatsRef.id;
  const payload  = { ...finalData, flatId };

  // 4) j'écris dans la collection globale avec le même payload
  await setDoc(flatsRef, payload);

  // 5) j'écris la sous-collection 
  await setDoc(
    doc(db, "MyFlats", userId, "Flats", flatId),
    payload
  );
}
