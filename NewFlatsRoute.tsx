import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { WizardProvider } from "../Config/NewFlatWizardContext";
import StepSellOrRent from "./steps/StepSellOrRent";
import StepPropertyType from "./steps/StepProperityType";
import StepCity from "./steps/StepCity";
import StepAddress from "./steps/StepAdress";
import StepCharacteristics from "./steps/StepCaracteristics";
import StepDPE from "./steps/StepDPE";
import StepImageUploader from "./steps/StepImageUploader";
import StepDescription from "./steps/StepDescription";
import StepPrice from "./steps/StepPrice";
import StepRecap from "./steps/StepRecap";
import NewFlatSuccess from "./steps/StepSuccess";


export default function NewFlatsWizardRoutes() {
  const navigate = useNavigate();

  return (
    <WizardProvider>
      <Routes>
        {/* redirection sur la 1ère étape */}
        <Route path="" element={<Navigate to="sell-or-rent" replace />} />

        <Route
          path="sell-or-rent"
          element={
            <StepSellOrRent
              onNext={() => navigate("/new-flat/property-type")}
              onBack={() => navigate("/new-flat/add-new-flat")}
            />
          }
        />

        <Route
          path="property-type"
          element={
            <StepPropertyType
              onNext={() => navigate("/new-flat/city")}
              onBack={() => navigate("/new-flat/sell-or-rent")}
            />
          }
        />

        <Route 
        path="city"
        element={
            <StepCity
            onNext={() => navigate("/new-flat/address")}
            onBack={() => navigate("/new-flat/property-type")}
            />
        }
        />

        <Route
          path="address"
          element={
            <StepAddress
              onNext={() => navigate("/new-flat/characteristics")}
              onBack={() => navigate("/new-flat/city")}
            />
          }
        />

        <Route
          path="characteristics"
          element={
            <StepCharacteristics
              onNext={() => navigate("/new-flat/dpe")}
              onBack={() => navigate("/new-flat/address")}
            />
          }
        />

        <Route
          path="dpe"
          element={
            <StepDPE
              onNext={() => navigate("/new-flat/images")}
              onBack={() => navigate("/new-flat/characteristics")}
            />
          }
        />

        <Route
          path="images"
          element={
            <StepImageUploader
              onNext={() => navigate("/new-flat/description")}
              onBack={() => navigate("/new-flat/dpe")}
            />
          }
        />

        <Route
          path="description"
          element={
            <StepDescription
              onNext={() => navigate("/new-flat/price")}
              onBack={() => navigate("/new-flat/images")}
            />
          }
        />
        <Route
          path="price"
          element={
            <StepPrice
              onNext={() => navigate("/new-flat/recap")}  
              onBack={() => navigate("/new-flat/description")}
            />
          }
        />

        <Route 
          path="recap"
          element={
            <StepRecap 
            onBack={() => navigate("/new-flat/price")}
            onNext={() => navigate("/new-flat/success")}
            />
          }
        />

        <Route path="success" element={<NewFlatSuccess />}/>
        
      </Routes>

    </WizardProvider>
  );
}
