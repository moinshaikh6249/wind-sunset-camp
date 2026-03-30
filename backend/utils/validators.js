import validator from 'validator';

export const validateEmail = (email) => {
  return validator.isEmail(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 8;
};

export const validatePhoneNumber = (phone) => {
  return phone && phone.length >= 10;
};

export const validateBookingData = (data) => {
  const errors = [];

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.push('Full name must be at least 2 characters');
  }

  if (!validateEmail(data.email)) {
    errors.push('Invalid email address');
  }

  if (!validatePhoneNumber(data.phone)) {
    errors.push('Phone number must be at least 10 digits');
  }

  if (!data.campId) {
    errors.push('Camp ID is required');
  }

  if (!data.numberOfPeople || data.numberOfPeople < 1) {
    errors.push('Number of people must be at least 1');
  }

  return errors;
};

export const validateReviewData = (data) => {
  const errors = [];

  if (data.name !== undefined && (!data.name || data.name.trim().length < 2)) {
    errors.push('Name must be at least 2 characters');
  }

  if (!data.campId) {
    errors.push('Camp ID is required');
  }

  if (!data.rating || data.rating < 1 || data.rating > 5) {
    errors.push('Rating must be between 1 and 5');
  }

  if (!data.comment || data.comment.length < 10) {
    errors.push('Comment must be at least 10 characters');
  }

  return errors;
};

export const validateMessageData = (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!validateEmail(data.email)) {
    errors.push('Invalid email address');
  }

  if (!data.subject || data.subject.trim().length < 5) {
    errors.push('Subject must be at least 5 characters');
  }

  if (!data.message || data.message.length < 10) {
    errors.push('Message must be at least 10 characters');
  }

  return errors;
};

