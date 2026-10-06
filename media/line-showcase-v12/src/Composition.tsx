import React from 'react';
import {Series} from 'remotion';
import {OpenSettings,ChoosePair,ConfirmPair,SendMessage,ReceiveReply,FilmProps} from './Scenes';
export const LineFilm:React.FC<FilmProps>=({language})=><Series>
 <Series.Sequence name="Open language settings" durationInFrames={210}><OpenSettings language={language}/></Series.Sequence>
 <Series.Sequence name="Choose the second language" durationInFrames={210}><ChoosePair language={language}/></Series.Sequence>
 <Series.Sequence name="Confirm the shared pair" durationInFrames={180}><ConfirmPair language={language}/></Series.Sequence>
 <Series.Sequence name="Send a household request" durationInFrames={240}><SendMessage language={language}/></Series.Sequence>
 <Series.Sequence name="Translate the reply" durationInFrames={240}><ReceiveReply language={language}/></Series.Sequence>
</Series>;
