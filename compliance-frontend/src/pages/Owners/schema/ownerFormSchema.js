import * as Yup from "yup";

export const ownerFormSchema = (isEditing) =>
  Yup.object({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    username: Yup.string()
      .min(3, "Username must be at least 3 characters")
      .required("Username is required"),
    email: Yup.string()
      .email("Enter a valid email address")
      .required("Email is required"),
    password: isEditing
      ? Yup.string().min(6, "Password must be at least 6 characters")
      : Yup.string()
          .min(6, "Password must be at least 6 characters")
          .required("Password is required"),
    contactNumber: Yup.string().matches(
      /^[0-9+\-\s()]*$/,
      "Enter a valid contact number",
    ),
    nic: Yup.string().matches(
      /^([0-9]{9}[vVxX]|[0-9]{12})$/,
      "Enter a valid NIC (e.g. 199012345678 or 920123456V)",
    ),
  });
