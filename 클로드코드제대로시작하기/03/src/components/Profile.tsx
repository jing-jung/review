import Image from 'next/image';

type ProfileProps = {
  name: string;
  bio: string;
  imageUrl: string;
};

export default function Profile({ name, bio, imageUrl }: ProfileProps) {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <Image
        src={imageUrl}
        alt={name}
        width={120}
        height={120}
        className="rounded-full mb-4"
      />
      <h1 className="text-2xl font-bold mb-2">{name}</h1>
      <p className="text-gray-600 dark:text-gray-400">{bio}</p>
    </div>
  );
}
