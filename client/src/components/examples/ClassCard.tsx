import ClassCard from '../ClassCard';
import blsImage from '@assets/generated_images/BLS_provider_training_a0cd6457.png';
import heartsaverImage from '@assets/generated_images/Heartsaver_community_training_b3867bec.png';

export default function ClassCardExample() {
  const handleRegister = (type: string) => {
    console.log(`Register for ${type} class`);
  };

  const handleLearnMore = (type: string) => {
    console.log(`Learn more about ${type} class`);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 p-6">
      <ClassCard
        title="BLS Provider"
        description="Advanced life support training for healthcare professionals and first responders."
        duration="4 hours"
        capacity={12}
        price={85}
        nextDate="March 15, 2024"
        image={blsImage}
        type="BLS"
        onRegister={() => handleRegister('BLS')}
        onLearnMore={() => handleLearnMore('BLS')}
      />
      
      <ClassCard
        title="Heartsaver CPR"
        description="Essential CPR and AED training for community members and lay rescuers."
        duration="3 hours"
        capacity={16}
        price={65}
        nextDate="March 18, 2024"
        image={heartsaverImage}
        type="Heartsaver"
        onRegister={() => handleRegister('Heartsaver')}
        onLearnMore={() => handleLearnMore('Heartsaver')}
      />
    </div>
  );
}