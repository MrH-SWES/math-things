// The film, shot by shot, in order. Each shot is a scene of exactly `seconds` seconds.
import * as rekenrek from './rekenrek.mjs';
import * as placeValue from './place-value.mjs';
import * as patternBlocks from './pattern-blocks.mjs';
import * as solids from './solids.mjs';
import * as volumeSpace from './volume-space.mjs';
import * as nets from './nets.mjs';
import * as slicing from './slicing-solids.mjs';
import * as endCard from './end-card.mjs';

export const SCENES = [rekenrek.opener, placeValue.scene, patternBlocks.scene, solids.scene, volumeSpace.scene,
  nets.scene, slicing.scene, rekenrek.closer, endCard.scene];
