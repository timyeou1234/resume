import {Composition} from 'remotion';
import {LineFilm} from './Composition';
import {OpenSettings,ChoosePair,ConfirmPair,SendMessage,ReceiveReply} from './Scenes';
export const RemotionRoot=()=> <>
 <Composition id="LineDesktopZH" component={LineFilm} durationInFrames={1080} fps={30} width={1920} height={1080} defaultProps={{language:'zh'}}/>
 <Composition id="LineDesktopEN" component={LineFilm} durationInFrames={1080} fps={30} width={1920} height={1080} defaultProps={{language:'en'}}/>
 <Composition id="LineMobileZH" component={LineFilm} durationInFrames={1080} fps={30} width={1080} height={1440} defaultProps={{language:'zh'}}/>
 <Composition id="LineMobileEN" component={LineFilm} durationInFrames={1080} fps={30} width={1080} height={1440} defaultProps={{language:'en'}}/>
 <Composition id="OpenSettings" component={OpenSettings} durationInFrames={210} fps={30} width={1920} height={1080} defaultProps={{language:'zh'}}/>
 <Composition id="ChoosePair" component={ChoosePair} durationInFrames={210} fps={30} width={1920} height={1080} defaultProps={{language:'zh'}}/>
 <Composition id="ConfirmPair" component={ConfirmPair} durationInFrames={180} fps={30} width={1920} height={1080} defaultProps={{language:'zh'}}/>
 <Composition id="SendMessage" component={SendMessage} durationInFrames={240} fps={30} width={1920} height={1080} defaultProps={{language:'zh'}}/>
 <Composition id="ReceiveReply" component={ReceiveReply} durationInFrames={240} fps={30} width={1920} height={1080} defaultProps={{language:'zh'}}/>
</>;
