import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'emailOrPhoneNumber', async: false })
export class EmailOrPhoneNumberValidator implements ValidatorConstraintInterface {
  validate(value: any) {
    // Validation logic to check if the value is a valid email or phone number
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9]{10}$/; // Modify this pattern as needed

    return emailPattern.test(value) || phonePattern.test(value);
  }

  defaultMessage() {
    return 'Value must be a valid email address or phone number';
  }
}
