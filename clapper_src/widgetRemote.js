const { GObject, Gtk, GstPlayer } = imports.gi;
const Buttons = imports.clapper_src.buttons;
const Misc = imports.clapper_src.misc;
const { PlayerRemote } = imports.clapper_src.playerRemote;

var WidgetRemote = GObject.registerClass(
class ClapperWidgetRemote extends Gtk.Grid
{
    _init(opts)
    {
        super._init({
            halign: Gtk.Align.CENTER,
            valign: Gtk.Align.CENTER,
        });

        Misc.loadCustomCss();

        this.player = new PlayerRemote();
        this.player.webclient.passMsgData = this.receiveWs.bind(this);

        /* FIXME: create better way to add buttons for
         * remote app without duplicating too much code */
        this.togglePlayButton = new Buttons.IconToggleButton(
            'media-playback-start-symbolic',
            'media-playback-pause-symbolic'
        );
        this.togglePlayButton.remove_css_class('flat');
        this.togglePlayButton.child.add_css_class('playbackicon');
        this.togglePlayButton.connect(
            'clicked', this.sendWs.bind(this, 'toggle_play')
        );

        this.attach(this.togglePlayButton, 0, 0, 1, 1);
    }

    sendWs(action, value)
    {
        const data = { action };

        /* do not send "null" or "undefined"
         * for faster network data transfer */
        if(value != null)
            data.value = value;

        this.player.webclient.sendMessage(data);
    }

    receiveWs(action, value)
    {
        switch(action) {
            case 'state_changed':
                switch(value) {
                    case GstPlayer.PlayerState.STOPPED:
                    case GstPlayer.PlayerState.PAUSED:
                        this.togglePlayButton.setPrimaryIcon();
                        break;
                    case GstPlayer.PlayerState.PLAYING:
                        this.togglePlayButton.setSecondaryIcon();
                        break;
                    default:
                        break;
                }
                break;
            case 'close':
                let root = this.get_root();
                root.run_dispose();
                break;
            default:
                break;
        }
    }
});
