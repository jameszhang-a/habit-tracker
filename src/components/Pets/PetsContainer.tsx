import { useState } from "react";
import Cat from "./Cat";

function PetsContainer() {
  const [pets] = useState([
    // {
    //   name: "cat1",
    //   id: "1",
    //   onClick: () => console.log("pet clicked"),
    // },
    {
      name: "cat5",
      id: "2",
      onClick: () => console.log("pet clicked"),
    },
  ]);

  return (
    <div className="absolute bottom-0 right-0 -z-50 h-[100%] w-[100%]">
      {pets.map((pet) => (
        <Cat
          key={pet.id}
          id={`${pet.id}`}
          name={pet.name}
          onClick={pet.onClick}
        />
      ))}
    </div>
  );
}

export { PetsContainer };
