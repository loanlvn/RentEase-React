import { useEffect, useState } from "react";
import {
  Controller,
  useForm,
  type Resolver,
  type SubmitHandler,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../auth/useAuth";
import { db } from "../../../services/firebaseConfig";
import { newFlatSchema } from "../components/Config/StepConfig";
import type { FlatData } from "../../../types/NewFlatsFormType";
import ButtonMotion from "../../../components/ButtonMotion";
import InputMotion, { TextareaMotion } from "../../../components/InputMotion";
import FullPageLoader from "../../../components/FullPageLoader";

const ADMIN_UID = "2VUmFYgHvgTzwyqfm5YLVAYLsWZ2";

export default function EditFlat() {
  const { currentUser, loading: authLoading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);

  const isAdmin = currentUser?.uid === ADMIN_UID;

  const resolver = yupResolver(newFlatSchema) as Resolver<FlatData>;
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FlatData>({
    resolver,
    defaultValues: {} as FlatData,
  });

  const rooms = watch("rooms") || 1;

  // redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, currentUser, navigate]);

  // fetch the flat either from global or from the user's MyFlats
  useEffect(() => {
    if (authLoading || !currentUser || !id) return;

    const path = isAdmin
      ? doc(db, "Flats", id)
      : doc(db, "MyFlats", currentUser.uid, "Flats", id);

    (async () => {
      setLoading(true);
      try {
        const snap = await getDoc(path);
        if (!snap.exists()) {
          setError("Listing not found");
          return;
        }
        const data = snap.data() as FlatData & { ownerId?: string };
        // if admin, capture the real ownerId from global doc
        if (isAdmin && data.ownerId) {
          setOwnerId(data.ownerId);
        } else if (!isAdmin) {
          // non admin: owner = currentUser
          setOwnerId(currentUser.uid);
        }
        reset(data);
      } catch (e) {
        console.error(e);
        setError("Failed to load listing");
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, currentUser, id, isAdmin, reset]);

  const onSubmit: SubmitHandler<FlatData> = async (data) => {
    if (!currentUser || !id || !ownerId) return;
    setError(null);
    try {
      // 1) update global listing
      await updateDoc(doc(db, "Flats", id), { ...data, ownerId });
      // 2) update in MyFlats under the correct owner
      await updateDoc(
        doc(db, "MyFlats", ownerId, "Flats", id),
        { ...data, ownerId }
      );
      navigate("/my-flats", { replace: true });
    } catch (e) {
      console.error(e);
      setError("Error saving changes");
    }
  };
  // incrément rooms
  const increment = () => setValue("rooms", rooms + 1);
  const decrement = () =>
    setValue("rooms", Math.max(1, rooms - 1));

  if (loading || authLoading) {
    return <FullPageLoader />;
  }
  if (error) {
    return (
      <p className="text-red-500 text-center py-4">{error}</p>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <ButtonMotion
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
      >
        ← Back
      </ButtonMotion>
      <h1 className="text-2xl text-blue-600 font-semibold mb-6">
        Edit Listing
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Title / City / Address / Construction Year */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">
              Title
            </label>
            <InputMotion
              {...register("title")}
              className="w-full border rounded-md px-3 py-2"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium">
              City
            </label>
            <InputMotion
              {...register("city")}
              className="w-full border rounded-md px-3 py-2"
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">
                {errors.city.message}
              </p>
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium">
              Address
            </label>
            <InputMotion
              {...register("address")}
              className="w-full border rounded-md px-3 py-2"
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">
                {errors.address.message}
              </p>
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium">
              Construction Year
            </label>
            <InputMotion
              type="number"
              {...register("constructionYear")}
              className="w-full border rounded-md px-3 py-2"
            />
            {errors.constructionYear && (
              <p className="text-red-500 text-sm mt-1">
                {errors.constructionYear.message}
              </p>
            )}
          </div>
        </div>

        {/* Type & Mode */}
        <fieldset className="flex space-x-6">
          <legend className="font-medium">Type</legend>
          {["house", "apartment"].map((val) => (
            <label
              key={val}
              className="flex items-center space-x-1"
            >
              <input
                type="radio"
                value={val}
                {...register("type")}
              />
              <span className="capitalize">{val}</span>
            </label>
          ))}
        </fieldset>
        {errors.type && (
          <p className="text-red-500 text-sm">
            {errors.type.message}
          </p>
        )}

        <fieldset className="flex space-x-6">
          <legend className="font-medium">Mode</legend>
          {["sell", "rent"].map((val) => (
            <label
              key={val}
              className="flex items-center space-x-1"
            >
              <input
                type="radio"
                value={val}
                {...register("mode")}
              />
              <span className="capitalize">{val}</span>
            </label>
          ))}
        </fieldset>
        {errors.mode && (
          <p className="text-red-500 text-sm">
            {errors.mode.message}
          </p>
        )}

        {/* Furnished & AC */}
        <div className="grid grid-cols-2 gap-6">
          <Controller
            name="furnished"
            control={control}
            render={({ field }) => (
              <fieldset className="flex space-x-4">
                <legend className="font-medium">
                  Furnished
                </legend>
                <label className="flex items-center space-x-1">
                  <input
                    type="radio"
                    checked={field.value === true}
                    onChange={() => field.onChange(true)}
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center space-x-1">
                  <input
                    type="radio"
                    checked={field.value === false}
                    onChange={() => field.onChange(false)}
                  />
                  <span>No</span>
                </label>
              </fieldset>
            )}
          />
          {errors.furnished && (
            <p className="text-red-500 text-sm">
              {errors.furnished.message}
            </p>
          )}
          <Controller
            name="airConditioned"
            control={control}
            render={({ field }) => (
              <fieldset className="flex space-x-4">
                <legend className="font-medium">AC</legend>
                <label className="flex items-center space-x-1">
                  <input
                    type="radio"
                    checked={field.value === true}
                    onChange={() => field.onChange(true)}
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center space-x-1">
                  <input
                    type="radio"
                    checked={field.value === false}
                    onChange={() => field.onChange(false)}
                  />
                  <span>No</span>
                </label>
              </fieldset>
            )}
          />
          {errors.airConditioned && (
            <p className="text-red-500 text-sm">
              {errors.airConditioned.message}
            </p>
          )}
        </div>

        {/* Rooms */}
        <div className="flex items-center space-x-4">
          <span className="font-medium">Rooms</span>
          <button
            type="button"
            onClick={decrement}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            –
          </button>
          <span>{rooms}</span>
          <button
            type="button"
            onClick={increment}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            +
          </button>
          {errors.rooms && (
            <p className="text-red-500 text-sm ml-4">
              {errors.rooms.message}
            </p>
          )}
        </div>

        {/* Price / Charges / Surface */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 font-medium">
              Price (€)
            </label>
            <InputMotion
              type="number"
              {...register("price")}
              className="w-full border rounded-md px-3 py-2"
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">
                {errors.price.message}
              </p>
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium">
              Charges (€)
            </label>
            <InputMotion
              type="number"
              {...register("charges")}
              className="w-full border rounded-md px-3 py-2"
            />
            {errors.charges && (
              <p className="text-red-500 text-sm mt-1">
                {errors.charges.message}
              </p>
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium">
              Surface (m²)
            </label>
            <InputMotion
              type="number"
              {...register("surface")}
              className="w-full border rounded-md px-3 py-2"
            />
            {errors.surface && (
              <p className="text-red-500 text-sm mt-1">
                {errors.surface.message}
              </p>
            )}
          </div>
        </div>

        {/* DPE / Consumption / Emission / Emission Consumption */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">
              DPE
            </label>
            <InputMotion
              {...register("dpe")}
              className="w-full border rounded-md px-3 py-2"
            />
            {errors.dpe && (
              <p className="text-red-500 text-sm mt-1">
                {errors.dpe.message}
              </p>
            )}
          </div>
          <div>
            <label className="block mb-1">
              Consumption (kWhEP/m²/yr)
            </label>
            <InputMotion
              type="number"
              {...register("consumption")}
              className="w-full border rounded-md px-3 py-2"
            />
            {errors.consumption && (
              <p className="text-red-500 text-sm mt-1">
                {errors.consumption.message}
              </p>
            )}
          </div>
          <div>
            <label className="block mb-1">
              Emission (kgCO₂/m²/yr)
            </label>
            <InputMotion
              type="number"
              {...register("emission")}
              className="w-full border rounded-md px-3 py-2"
            />
            {errors.emission && (
              <p className="text-red-500 text-sm mt-1">
                {errors.emission.message}
              </p>
            )}
          </div>
          <div>
            <label className="block mb-1">
              Emission Consumption
            </label>
            <InputMotion
              {...register("emissionConsumption")}
              className="w-full border rounded-md px-3 py-2"
            />
            {errors.emissionConsumption && (
              <p className="text-red-500 text-sm mt-1">
                {errors.emissionConsumption.message}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium">
            Description
          </label>
          <TextareaMotion
            rows={4}
            {...register("description")}
            className="w-full border rounded-md px-3 py-2"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="text-right">
          <ButtonMotion
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 hover:opacity-90"
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </ButtonMotion>
        </div>
      </form>
    </div>
  );
}
