import { Channel } from '.';
import { ChangeDetectorRef } from '@angular/core';

export class ChannelCollection {
    public selectedChannel: Channel;
    private _channels: Channel[] = [];

    get Channels(): Channel[]  {
        return this._channels;
    }

    AddChannel(channel: Channel): void {
        if (this.selectedChannel) {
            this.selectedChannel.selected = false;
        }
        channel.selected = true;
        this._channels.push(channel);
        this.selectedChannel = channel;
    }

    SelectChannel(name: string) {
        const channelToSelect = this._channels.find(c => c.channelName === name);
        if (channelToSelect) {
            if (this.selectedChannel) {
                this.selectedChannel.selected = false;
            }
            channelToSelect.selected = true;
            this.selectedChannel = channelToSelect;
        }
    }
}
