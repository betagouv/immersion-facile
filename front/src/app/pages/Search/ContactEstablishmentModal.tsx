import { Modal, ModalClose, ModalContent } from "@dataesr/react-dsfr";
import React, { ReactNode, useReducer } from "react";
import { ContactMethod } from "shared/src/formEstablishment/FormEstablishment.dto";
import { RomeCode } from "shared/src/rome";
import { SiretDto } from "shared/src/siret";
import { Title, SubTitle } from "react-design-system/immersionFacile";
import { ContactByEmail } from "./ContactByEmail";
import { ContactByPhone } from "./ContactByPhone";
import { ContactInPerson } from "./ContactInPerson";

type ModalState = {
  isOpen: boolean;
  isValidating: boolean;
  siret: SiretDto;
  romeLabel: string;
  contactMethod?: ContactMethod;
};

type ModalAction =
  | {
      type: "CLICKED_OPEN";
      payload: {
        immersionOfferRome: RomeCode;
        immersionOfferSiret: SiretDto;
        siret: SiretDto;
        romeLabel: string;
        contactMethod?: ContactMethod;
      };
    }
  | { type: "CLICKED_CLOSE" }
  | { type: "CLICKED_VALIDATE" }
  | { type: "VALIDATION_HANDLED" };

const modalReducer = (state: ModalState, action: ModalAction): ModalState => {
  switch (action.type) {
    case "CLICKED_OPEN":
      return { ...state, isOpen: true, ...action.payload };
    case "CLICKED_CLOSE":
      return {
        romeLabel: "",
        siret: "",
        isOpen: false,
        isValidating: false,
      };
    case "CLICKED_VALIDATE":
      return { ...state, isOpen: false, isValidating: true };
    case "VALIDATION_HANDLED":
      return {
        romeLabel: "",
        siret: "",
        isOpen: false,
        isValidating: false,
      };
    default: {
      const shouldNeverBeAssigned: never = action;
      return shouldNeverBeAssigned;
    }
  }
};

export const useContactEstablishmentModal = () => {
  const initialModalState: ModalState = {
    romeLabel: "",
    siret: "",
    isOpen: false,
    isValidating: false,
  };

  const [modalState, dispatch] = useReducer(modalReducer, initialModalState);

  return { modalState, dispatch };
};

type ContactEstablishmentModalProps = {
  modalState: ModalState;
  dispatch: React.Dispatch<ModalAction>;
  onSuccess: () => void;
};

export const ContactEstablishmentModal = ({
  modalState,
  dispatch,
  onSuccess,
}: ContactEstablishmentModalProps) => {
  const hide = () => dispatch({ type: "CLICKED_CLOSE" });

  const hideAndShowSuccess = () => {
    hide();
    onSuccess();
  };

  return (
    <Modal isOpen={modalState.isOpen} hide={hide}>
      <ModalClose hide={hide} title="Close the modal window" />
      <ModalContent>
        <ModalContactContent
          modalState={modalState}
          onSuccess={hideAndShowSuccess}
        />
      </ModalContent>
    </Modal>
  );
};

type ModalContactContentProps = {
  modalState: ModalState;
  onSuccess: () => void;
};

const ModalContactContent = ({
  modalState,
  onSuccess,
}: ModalContactContentProps) => {
  switch (modalState.contactMethod) {
    case "EMAIL":
      return (
        <ContactByEmail
          siret={modalState.siret}
          romeLabel={modalState.romeLabel}
          onSuccess={onSuccess}
        />
      );
    case "PHONE":
      return (
        <ContactByPhone
          siret={modalState.siret}
          romeLabel={modalState.romeLabel}
          onSuccess={onSuccess}
        />
      );
    case "IN_PERSON":
      return (
        <ContactInPerson
          siret={modalState.siret}
          romeLabel={modalState.romeLabel}
          onSuccess={onSuccess}
        />
      );
    default:
      return <AdvisesForContact />;
  }
};

const Paragraph = ({ children }: { children: ReactNode }) => (
  <p className="mb-3">{children}</p>
);

const Bold = ({ children }: { children: string }) => (
  <span className="font-bold">{children}</span>
);

const AdvisesForContact = () => (
  <div>
    <Title red>Tentez votre chance</Title>
    <Paragraph>
      Cette entreprise peut recruter sur ce m??tier et ??tre int??ress??e pour vous
      recevoir en immersion. Tentez votre chance en la contactant !
    </Paragraph>

    <Title>Nos conseils pour cette premi??re prise de contact ! </Title>

    <SubTitle>Comment pr??senter votre demande ? </SubTitle>
    <Paragraph>
      Soyez <Bold>direct, concret et courtois</Bold>. Pr??sentez-vous, indiquez
      que vous avez eu le nom et le num??ro de t??l??phone de votre interlocutrice
      ou interlocuteur gr??ce ?? <Bold>Immersion Facilit??e</Bold> puis pr??sentez
      simplement votre projet et l???objectif que vous recherchez en effectuant
      une immersion.
    </Paragraph>
    <Paragraph>
      <Bold>Par exemple : </Bold>
      <span className="italic">
        ???Je souhaite devenir m??canicien auto et je voudrais d??couvrir comment ce
        m??tier se pratique dans un garage comme le v??tre. Ca me permettra de
        v??rifier que cela me pla??t vraiment. La personne qui m???accueillera et me
        pr??sentera le m??tier pourra aussi v??rifier si ce m??tier est fait pour
        moi.???
      </span>
    </Paragraph>
    <Paragraph>
      Vous pouvez indiquer ?? votre interlocutrice ou interlocuteur que{" "}
      <Bold>
        cette immersion sera encadr??e par une convention sign??e par l'organisme
        qui vous suit.
      </Bold>
    </Paragraph>
    <Paragraph>
      Indiquez lui le moment o?? vous aimeriez faire une immersion et pourquoi
      vous voulez la faire ?? cette date.
    </Paragraph>
    <Paragraph>
      <Bold>Par exemple : </Bold>
      <span className="italic">
        ???il faudrait que je fasse une immersion avant de m???inscrire ?? une
        formation. ???
      </span>
    </Paragraph>
    <Paragraph>
      Indiquez ??galement le <Bold>nombre de jours</Bold> que vous aimeriez faire
      en immersion si vous le savez d??j??.
    </Paragraph>
    <Paragraph>
      Concluez en lui demandant <Bold>un rendez-vous</Bold> pour qu???il/elle se
      rende compte du s??rieux de votre projet.
    </Paragraph>

    <SubTitle>Comment expliquer simplement ce qu???est une immersion ?</SubTitle>
    <Paragraph>
      C???est un stage d???observation, strictement encadr?? d???un point de vue
      juridique. Vous conservez votre statut et ??tes couvert par votre P??le
      emploi,votre Mission Locale ou le Conseil d??partemental (en fonction de
      votre situation).
    </Paragraph>
    <Paragraph>
      Le r??le de celui qui vous accueillera est de vous pr??senter le m??tier et
      de v??rifier avec vous que ce m??tier vous convient en vous faisant des
      retours les plus objectifs possibles. Pendant la dur??e de votre pr??sence,
      vous pouvez aider les salari??s en donnant un coup de main mais vous n?????tes
      pas l?? pour remplacer un coll??gue absent.
    </Paragraph>

    <SubTitle>Quelle est la dur??e d???une immersion ?</SubTitle>
    <Paragraph>
      Les immersions se font le plus souvent pendant une semaine ou deux.
      <Bold>Il n???est pas possible de d??passer un mois</Bold>. Il est possible de
      faire une immersion de seulement un ou deux jours mais vous ne d??couvrirez
      pas parfaitement un m??tier.
    </Paragraph>

    <SubTitle>Bon ?? savoir ! </SubTitle>
    <Paragraph>
      <Bold>Il n???est pas n??cessaire d???apporter votre CV</Bold>. Vous ??tes l??
      pour demander ?? d??couvrir un m??tier et c???est ce projet qui est important,
      pas vos exp??riences professionnelles ni votre formation !
    </Paragraph>
  </div>
);
