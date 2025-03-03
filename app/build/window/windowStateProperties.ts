export enum MainWindowState {
    Normal,
    Minimized,
    Maximized,
    FullScreenShowTeacher,
    MiniMe
}

export type ngRoute = 'chat' | 'speaker-audio';
export type frameState = 'minimized' | 'maximized' | 'normal' | 'fullScreen' | 'unknown';
export type frameSizeType = 'normal' | 'mini-me' | 'fullScreen';

export interface IMainWindowStateProperties {
    frameState: frameState;
    titleBarVisible: boolean;
    route: ngRoute;
    forcedSize: boolean;
    frameSizeType: frameSizeType;
}

export class MainWindowStateProperties {
    public static fromStateEnum(s: MainWindowState): IMainWindowStateProperties {
        switch (s) {
            case MainWindowState.Normal: {
                return this.normalProperties();
            }
            case MainWindowState.Minimized: {
                return this.minimizedProperties();
            }
            case MainWindowState.Maximized: {
                return this.maximizedProperties();
            }
            case MainWindowState.FullScreenShowTeacher: {
                return this.fullScreenShowTeacherProperties();
            }
            case MainWindowState.MiniMe: {
                return this.miniMeProperties();
            }
        }
    }

    public static normalProperties(): IMainWindowStateProperties {
        return {
            frameState: 'normal',
            titleBarVisible: true,
            route: 'chat',
            forcedSize: false,
            frameSizeType: 'normal'
        }
    }

    public static minimizedProperties(): IMainWindowStateProperties {
        const minimizedProps = this.normalProperties();
        minimizedProps.frameState = 'minimized';
        return minimizedProps;
    }

    public static maximizedProperties(): IMainWindowStateProperties {
        const maximizedProps = this.normalProperties();
        maximizedProps.frameState = 'maximized';
        return maximizedProps;
    }

    public static fullScreenShowTeacherProperties(): IMainWindowStateProperties {
        const fullScreenShowTeacherProps = this.normalProperties();
        fullScreenShowTeacherProps.frameSizeType = 'fullScreen';
        fullScreenShowTeacherProps.frameState = 'fullScreen';
        fullScreenShowTeacherProps.titleBarVisible = false;
        return fullScreenShowTeacherProps;
    }

    public static miniMeProperties(): IMainWindowStateProperties {
        const miniMeProps = this.normalProperties();
        miniMeProps.frameSizeType = 'mini-me';
        miniMeProps.forcedSize = true;
        miniMeProps.titleBarVisible = false;
        miniMeProps.route = 'speaker-audio';
        return miniMeProps;
    }

    public static isMiniMe(props: IMainWindowStateProperties): boolean {
        return (props.frameSizeType == this.miniMeProperties().frameSizeType &&
            props.frameState === this.miniMeProperties().frameState &&
            props.forcedSize === this.miniMeProperties().forcedSize &&
            props.route === this.miniMeProperties().route &&
            props.titleBarVisible === this.miniMeProperties().titleBarVisible);
    }
}