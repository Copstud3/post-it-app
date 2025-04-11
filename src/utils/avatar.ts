const avatarStyles = [
  "adventurer",
  "adventurer-neutral",
  "avataaars",
  "avataaars-neutral",
  "big-ears",
  "big-ears-neutral",
  "big-smile",
  "bottts",
  "bottts-neutral",
  "croodles",
  "croodles-neutral",
  "fun-emoji",
  "icons",
  "identicon",
  "initials",
  "lorelei",
  "lorelei-neutral",
  "micah",
  "miniavs",
  "open-peeps",
  "personas",
  "pixel-art",
  "pixel-art-neutral",
  "shapes",
  "thumbs",
];

export const getRandomAvatarStyle = (): string => {
  const randomIndex = Math.floor(Math.random() * avatarStyles.length);
  return avatarStyles[randomIndex];
};

export const generateRandomAvatar = async (email: string): Promise<string> => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const _email = email.trim();
  if (!emailRegex.test(_email)) {
    throw new Error("Invalid email");
  }

  const entropySource = () => Math.random().toString(36).substring(2, 7);
  const replaceAt = `-${entropySource()}-`;
  const replaceDot = `-${entropySource()}-`;
  const seed = _email.replace("@", replaceAt).replace(/\./g, replaceDot);
  const randomAvatarStyle = getRandomAvatarStyle();

  if (!randomAvatarStyle || !avatarStyles.includes(randomAvatarStyle)) {
    throw new Error("Something failed: Invalid avatar style");
  }

  const avatarUrl = `https://api.dicebear.com/5.x/${randomAvatarStyle}/svg?seed=${seed}&size=200&radius=50`;
  return avatarUrl;
};

export const generateAvatarTag = (
  username: string,
  avatarUrl: string
): string => {
  return `<img src="${avatarUrl}" alt="Avatar for ${username}" />`;
};
