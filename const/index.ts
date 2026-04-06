import Logo from '../assets/images/hahu_logo.png';
import Write from '../assets/images/Write.png';
import F2I from '../assets/images/F2I.png';
import find from '../assets/images/find.png';
import listen from '../assets/images/listen.png';
import rearr from '../assets/images/rearr.png';
import build from '../assets/images/build.png';
import speak from '../assets/images/speak.png';
import story from '../assets/images/story.png';
export const images={
    Logo,
    Write,
    F2I,
    find,
    listen,
    rearr,
    build,
    speak,
    story

}
export const categories = [
  { id: "1", name: "Trace", icon: "fountain-pen-tip", color: "#FF6B6B",route:"tracing" },
  { id: "2", name: "Match", icon: "puzzle", color: "#4ECDC4",route:"match" },
  { id: "3", name: "Speak", icon: "microphone", color: "#20BF6B",route:"speakup" },
  { id: "4", name: "Build", icon: "toy-brick-outline", color: "#6C5CE7",route:"wordbuilder" },
];
export const GAMES = [
  {
    id: '1',
    title: 'Fidel Tracing',
    desc: 'Write letters',
    image: images.Write,
    featured: true,
    route:"tracing"
  },
  {
    id: '2',
    title: 'Fidel Match',
    desc: 'Find pairs',
    image: images.find,
    route:"match"
  },
  {
    id: '3',
    title: 'Pic-to-Word',
    desc: 'Match images',
    image: images.F2I,
    route:"pictoword",
  },
  {
    id: '4',
    title: 'Word Builder',
    desc: 'Construct words',
    image: images.build,
    featured: true,
    route:"wordbuilder"
  },

  {
    id: '5',
    title: 'Listen & Fill',
    desc: 'Audio quiz',
    image: images.listen,
    route:"listenandfill"
  },
  {
    id: '6',
    title: 'Speak Up',
    desc: 'Practice speaking',
    image: images.speak,
    featured: true,
    route:"speakup"
  },
  {
    id: '7',
    title: 'Story Quiz',
    desc: 'Comprehension',
    image: images.story,
    route:"storyquiz"
  }
];
export const COLORS = {
  background: '#1F1F39',
  card: '#2F2F42',
  primary: '#3D5CFF',
  secondary: '#7C3AED',
  textPrimary: '#FFFFFF',
  textSecondary: '#BABBC9',
  muted: '#6E6E8D',
  border: '#2F2F42',
  danger: '#FF6B6B',
};

export const SPACING = {
  sm: 10,
  md: 15,
  lg: 20,
  xl: 25,
};

export const RADIUS = {
  md: 12,
  lg: 15,
  xl: 20,
  round: 999,
};

export const FONTS = {
  bold: 'Poppins-Bold',
  semi: 'Poppins-SemiBold',
  medium: 'Poppins-Medium',
};
