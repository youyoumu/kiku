/**
 * @import { KikuPlugin } from "#/plugins/pluginTypes";
 */

/**
 * @type { KikuPlugin }
 */
export const plugin = {
  Pitch: (props) => {
    const DefaultPitch = props.DefaultPitch;
    let ref;

    return DefaultPitch({
      index: props.index,
      pitchInfo: props.pitchInfo,
      ref: ref,
    });
  },
};
