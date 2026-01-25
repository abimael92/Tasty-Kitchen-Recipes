import { serverSanityClient } from '../sanityClient';

export const fetchSanityUserByUid = async (uid: string) => {
	return serverSanityClient.fetch(
		`*[_type == "user" && uid == $uid][0]{
      _id,
      uid,
      name,
      lastname,
      email,
      image,
      role,
      bio,
      location,
      phone,
      dietPreference,
      allergies,
      preferredCuisine,
      profileImage,
      joinedAt,
      bmiHistory,
      latestBMI,
      bmiCategory,
      healthGoals
    }`,
		{ uid }
	);
};

export const requireSanityUserByUid = async (uid: string) => {
	const user = await fetchSanityUserByUid(uid);
	if (!user) {
		return null;
	}
	return user;
};
