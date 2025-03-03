"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainWindowStateProperties = exports.MainWindowState = void 0;
var MainWindowState;
(function (MainWindowState) {
    MainWindowState[MainWindowState["Normal"] = 0] = "Normal";
    MainWindowState[MainWindowState["Minimized"] = 1] = "Minimized";
    MainWindowState[MainWindowState["Maximized"] = 2] = "Maximized";
    MainWindowState[MainWindowState["FullScreenShowTeacher"] = 3] = "FullScreenShowTeacher";
    MainWindowState[MainWindowState["MiniMe"] = 4] = "MiniMe";
})(MainWindowState = exports.MainWindowState || (exports.MainWindowState = {}));
class MainWindowStateProperties {
    static fromStateEnum(s) {
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
    static normalProperties() {
        return {
            frameState: 'normal',
            titleBarVisible: true,
            route: 'chat',
            forcedSize: false,
            frameSizeType: 'normal'
        };
    }
    static minimizedProperties() {
        const minimizedProps = this.normalProperties();
        minimizedProps.frameState = 'minimized';
        return minimizedProps;
    }
    static maximizedProperties() {
        const maximizedProps = this.normalProperties();
        maximizedProps.frameState = 'maximized';
        return maximizedProps;
    }
    static fullScreenShowTeacherProperties() {
        const fullScreenShowTeacherProps = this.normalProperties();
        fullScreenShowTeacherProps.frameSizeType = 'fullScreen';
        fullScreenShowTeacherProps.frameState = 'fullScreen';
        fullScreenShowTeacherProps.titleBarVisible = false;
        return fullScreenShowTeacherProps;
    }
    static miniMeProperties() {
        const miniMeProps = this.normalProperties();
        miniMeProps.frameSizeType = 'mini-me';
        miniMeProps.forcedSize = true;
        miniMeProps.titleBarVisible = false;
        miniMeProps.route = 'speaker-audio';
        return miniMeProps;
    }
    static isMiniMe(props) {
        return (props.frameSizeType == this.miniMeProperties().frameSizeType &&
            props.frameState === this.miniMeProperties().frameState &&
            props.forcedSize === this.miniMeProperties().forcedSize &&
            props.route === this.miniMeProperties().route &&
            props.titleBarVisible === this.miniMeProperties().titleBarVisible);
    }
}
exports.MainWindowStateProperties = MainWindowStateProperties;
//# sourceMappingURL=windowStateProperties.js.map