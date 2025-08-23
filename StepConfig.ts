import * as yup from 'yup';

export const newFlatSchema = yup.object({
  mode: yup.string().oneOf(['sell','rent'], 'Required').required('Required'),

  type: yup.string().oneOf(['house','apartment'], 'Required').required('Required'),

  city: yup.string()
  .trim()
  .min(2, "Name of the city is too short")
  .max(100, "Name of the city is too long")
  .matches(
    /^[A-Za-zÀ-ÖØ-öø-ÿ'\- ]+$/,
    "City may contain only letters, spaces, adden and apostrophe"
  )
  .required("City is required"),

  address: yup.string().min(5, "Adress is too short.")
  .matches(/\d+/,"Adress may contain at least a number.").trim().required('Required'),

  surface: yup.number().typeError("Surface is required.").positive("Surface may be positive.")
  .required("Surface is required.").min(10,"The area size cannot be under 10m²"),

  rooms: yup.number().typeError("Number of rooms is required.")
  .integer("Integer required.")
  .min(1,"At least one room.")
  .required("Number of rooms is required."),

  furnished: yup.boolean().required("Is it furnised ?"),

  airConditioned: yup.boolean().required("Is it air conditioned ?"),

  constructionYear: yup.number().typeError("Construction year is required.")
  .integer("Integer is required.")
  .min(1800, "Your property cannot be build before 1800").max(2027, "Your property cannot be build after 2027.")
  .required("Construction year is required."),
  
  notSubjectToDpe: yup.boolean().required(),

  consumption: yup.number()
  .when("notSubjectToDpe", {
    is: false,
    then: schema => schema.positive().required("Consumption is required.").min(1,"The minimal consumption is 1 kWh/m²/year"),
    otherwise: schema => schema.notRequired(),
  }),

  emission: yup.number()
  .when("notSubjectToDpe", {
    is: false,
    then: schema => schema.positive().required("Emission is required.").min(1,"The minimal emission is 1 kWh/m²/year"),
    otherwise: schema => schema.notRequired(),
  }),

  dpe: yup.string().oneOf(['A','B','C','D','E','F','G'], 'Required').required('DPE is required.'),

  emissionConsumption: yup.string().oneOf(['A','B','C','D','E','F','G'], 'Required').required('Emission is required.'),

  images: yup
  .array()
  .of(
    yup
      .mixed<File | string>()
      .test(
        "fileType",
        "image must be in (jpeg ou png)",
        (value) => {
          if (typeof value === "string") return true;
          return (
            value instanceof File &&
            ["image/jpeg", "image/png"].includes(value.type)
          );
        }
      )
  )
  .min(1, "At least one picture")
  .max(8, "Maximum 8 images")
  .required("Images are required"),

  title: yup.string().min(10, 'Your title should have 10 characters minmum.').max(180,'Your title cannot have more than 180 characters.'),

  description: yup.string().min(20, 'The description should have at least 20 characters').required('Required'),

  price: yup.number().typeError('Number').positive('Positive').required('Price is required').min(1, 'The minimum price is 1 euro'),

  charges: yup.number().typeError('Number').positive("Positive").required('Charges are required.').min(1, 'The minimal price for charges is 1 euro'), 

});



