import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import ButtonMotion from "../../../components/ButtonMotion";
import FullPageLoader from "../../../components/FullPageLoader";

export default function Profile() {
  const navigate = useNavigate();
  const {
    currentUser,
    userProfile,
    loading: authLoading,
    loadingProfile,

  } = useAuth();

  // redirect if not authenticated
  useEffect(() => {
    if (authLoading || loadingProfile) return;
    if (!currentUser || !userProfile) {
      navigate("/login", { replace: true });
      return;
    }
  }, [authLoading, loadingProfile, currentUser, userProfile, navigate]);

  // format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // calculate age from birth date
  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (authLoading || loadingProfile) {
    return <FullPageLoader />   
  }


  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <ButtonMotion
              onClick={() => navigate("/profile/edit")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Profile
            </ButtonMotion>
          </div>

          {/* Profile Avatar / Initials */}
          <div className="flex items-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-6">
              {userProfile.firstName.charAt(0).toUpperCase()}
              {userProfile.lastName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {userProfile.firstName} {userProfile.lastName}
              </h2>
              <p className="text-gray-600">{calculateAge(userProfile.birthDate)} years old</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h3>
          
          <div className="space-y-6">
            {/* First Name */}
            <div className="flex flex-col sm:flex-row sm:items-center">
              <label className="text-sm font-medium text-gray-500 w-32 mb-1 sm:mb-0">
                First Name
              </label>
              <div className="flex-1">
                <p className="text-gray-900 text-lg">{userProfile.firstName}</p>
              </div>
            </div>

            {/* Last Name */}
            <div className="flex flex-col sm:flex-row sm:items-center">
              <label className="text-sm font-medium text-gray-500 w-32 mb-1 sm:mb-0">
                Last Name
              </label>
              <div className="flex-1">
                <p className="text-gray-900 text-lg">{userProfile.lastName}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col sm:flex-row sm:items-center">
              <label className="text-sm font-medium text-gray-500 w-32 mb-1 sm:mb-0">
                Email
              </label>
              <div className="flex-1">
                <p className="text-gray-900 text-lg">{userProfile.email}</p>
              </div>
            </div>

            {/* Birth Date */}
            <div className="flex flex-col sm:flex-row sm:items-center">
              <label className="text-sm font-medium text-gray-500 w-32 mb-1 sm:mb-0">
                Birth Date
              </label>
              <div className="flex-1">
                <p className="text-gray-900 text-lg">{formatDate(userProfile.birthDate)}</p>
              </div>
            </div>

            {/* Age */}
            <div className="flex flex-col sm:flex-row sm:items-center">
              <label className="text-sm font-medium text-gray-500 w-32 mb-1 sm:mb-0">
                Age
              </label>
              <div className="flex-1">
                <p className="text-gray-900 text-lg">{calculateAge(userProfile.birthDate)} years</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h3>
          
          <div className="space-y-6">
            {/* User ID */}
            <div className="flex flex-col sm:flex-row sm:items-center">
              <label className="text-sm font-medium text-gray-500 w-32 mb-1 sm:mb-0">
                User ID
              </label>
              <div className="flex-1">
                <p className="text-gray-900 text-sm font-mono bg-gray-100 p-2 rounded">
                  {currentUser?.uid}
                </p>
              </div>
            </div>

            {/* Account Created On */}
            {currentUser?.metadata?.creationTime && (
              <div className="flex flex-col sm:flex-row sm:items-center">
                <label className="text-sm font-medium text-gray-500 w-32 mb-1 sm:mb-0">
                  Created On
                </label>
                <div className="flex-1">
                  <p className="text-gray-900 text-lg">
                    {new Date(currentUser.metadata.creationTime).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Last Sign-In */}
            {currentUser?.metadata?.lastSignInTime && (
              <div className="flex flex-col sm:flex-row sm:items-center">
                <label className="text-sm font-medium text-gray-500 w-32 mb-1 sm:mb-0">
                  Last Sign-In
                </label>
                <div className="flex-1">
                  <p className="text-gray-900 text-lg">
                    {new Date(currentUser.metadata.lastSignInTime).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <ButtonMotion
            onClick={() => navigate("/profile/edit")}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Edit My Information
          </ButtonMotion>
          
          <ButtonMotion
            onClick={() => navigate("/")}
            className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Back to Home
          </ButtonMotion>
        </div>
      </div>
    </div>
  );
}
