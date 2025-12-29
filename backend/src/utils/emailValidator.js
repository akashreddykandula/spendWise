const blockedDomains = [
  'test.com',
  'example.com',
  'mail.com',
  'email.com',
  'demo.com',
];

export const isValidEmailDomain = email => {
  const parts = email.split ('@');
  if (parts.length !== 2) return false;

  const domain = parts[1].toLowerCase ();
  return !blockedDomains.includes (domain);
};
