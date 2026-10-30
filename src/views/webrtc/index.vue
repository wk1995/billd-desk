<template>
  <div
    class="webrtc-wrap"
    :class="{ 'native-size': displayMode === 'native' }"
  >
    <div
      ref="dragEl"
      class="drag"
      :style="style"
    >
      <span
        class="txt"
        @click="showDetail = !showDetail"
      >
        连接详情
      </span>

      <div
        class="info"
        :class="{ show: showDetail }"
      >
        <div
          class="debug-area"
          @click="handleOpenDebug"
        ></div>
        <div
          v-if="appStore.showDebug"
          class="debug-info"
        >
          <div>
            <span
              class="item"
              @click="windowReload"
              >刷新</span
            >
            <span>，</span>
            <span
              class="item"
              @click="handleOpenDevTools({ windowId })"
              >控制台</span
            >
          </div>

          <div>
            <span>窗口Id：</span>
            <span
              class="link"
              @click="handleCopy(windowId)"
            >
              {{ windowId }}
            </span>
            <span>，</span>
            <span>roomId：</span>
            <span
              class="link"
              @click="handleCopy(roomId)"
            >
              {{ roomId }}
            </span>
          </div>
          <div>
            <span>socketId：</span>
            <span
              class="link"
              @click="handleCopy(mySocketId)"
            >
              {{ mySocketId }}
            </span>
          </div>
        </div>

        <div class="link-config">
          <div class="link-item">
            <n-space>
              <div class="link-label">模式：</div>
              <n-radio
                :checked="!isWatchMode"
                @change="isWatchMode = false"
              >
                控制模式
              </n-radio>
              <n-radio
                :checked="isWatchMode"
                @change="isWatchMode = true"
              >
                观看模式
              </n-radio>
            </n-space>
          </div>
          <div class="link-item">
            <n-space>
              <div class="link-label">鼠标：</div>
              <n-radio
                :checked="showCursor"
                @change="showCursor = true"
              >
                显示
              </n-radio>
              <n-radio
                :checked="!showCursor"
                @change="showCursor = false"
              >
                隐藏
              </n-radio>
            </n-space>
          </div>
          <div class="link-item">
            <n-space>
              <div class="link-label">码率：</div>
              <n-radio-group v-model:value="currentMaxBitrate">
                <n-radio
                  v-for="item in maxBitrate"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </n-radio>
              </n-radio-group>
            </n-space>
          </div>
          <div class="link-item">
            <n-space>
              <div class="link-label">帧率：</div>
              <n-radio-group v-model:value="currentMaxFramerate">
                <n-radio
                  v-for="item in maxFramerate"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </n-radio>
              </n-radio-group>
            </n-space>
          </div>
          <div class="link-item">
            <n-space>
              <div class="link-label">分辨率：</div>
              <n-radio-group v-model:value="currentResolutionRatio">
                <n-radio
                  v-for="item in resolutionRatio"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </n-radio>
              </n-radio-group>
            </n-space>
          </div>
          <RtcQualityCpt
            :metrics="actualVideoStats"
            :display="actualDisplay"
          />
          <div class="link-item">
            <n-space>
              <div class="link-label">显示：</div>
              <n-radio-group v-model:value="displayMode">
                <n-radio value="fit">适应窗口</n-radio>
                <n-radio value="native">原始像素 1:1</n-radio>
              </n-radio-group>
            </n-space>
          </div>
          <div class="link-item">
            <n-space>
              <div class="link-label">视频内容：</div>
              <n-radio-group v-model:value="currentVideoContentHint">
                <n-radio
                  v-for="item in videoContentHint"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </n-radio>
              </n-radio-group>
            </n-space>
          </div>
          <div class="link-item">
            <n-space>
              <div class="link-label">音频内容：</div>
              <n-radio-group v-model:value="currentAudioContentHint">
                <n-radio
                  v-for="item in audioContentHint"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </n-radio>
              </n-radio-group>
            </n-space>
          </div>
          <div class="link-item">
            <n-space>
              <div class="link-label">分辨率：</div>
              <div class="item">
                {{
                  receivedVideoStats?.width && receivedVideoStats?.height
                    ? `${receivedVideoStats.width}×${receivedVideoStats.height}`
                    : '—'
                }}
              </div>
            </n-space>
          </div>
          <div class="link-item">
            <n-space>
              <div class="link-label">帧率：</div>
              <div class="item">
                {{ receivedVideoStats?.fps?.toFixed(1) ?? '—' }}
              </div>
            </n-space>
          </div>
          <div class="link-item">
            <n-space>
              <div class="link-label">延迟：</div>
              <div class="item">
                {{ rtcRtt }}
              </div>
            </n-space>
          </div>
          <div class="link-item">
            <n-space>
              <div class="link-label">丢包：</div>
              <div class="item">
                {{ rtcLoss }}
              </div>
            </n-space>
          </div>
          <div class="link-item">
            <n-space>
              <div class="link-label"></div>
              <div
                class="item btn"
                @click="handleClose"
              >
                关闭连接
              </div>
            </n-space>
          </div>
        </div>
      </div>
    </div>

    <div
      ref="videoWrapRef"
      class="remote-video"
      :class="{ 'hide-cursor': !showCursor, watch: isWatchMode }"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @dblclick="handleDoublelclick"
      @contextmenu="handleContextmenu"
    ></div>

    <div
      v-if="loading"
      class="loading"
    >
      正在连接...
    </div>

    <div
      v-if="connectTimeoutTip"
      class="connect-timeout"
    >
      <div class="txt">{{ connectTimeoutTip }}</div>
      <div
        class="btn"
        @click="closeSelfWindow()"
      >
        关闭窗口
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useDraggable } from '@vueuse/core';
import {
  computeBox,
  copyToClipBoard,
  getRandomString,
  windowReload,
} from 'billd-utils';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import RtcQualityCpt from '@/components/rtcQuality/index.vue';
import { ENGLISH_LETTER, NUT_KEY_MAP, WINDOW_ID_ENUM } from '@/constant';
import { IPC_EVENT } from '@/event';
import { useIpcRendererSend } from '@/hooks/use-ipcRendererSend';
import { useRTCParams } from '@/hooks/use-rtcParams';
import { useTip } from '@/hooks/use-tip';
import { useWebsocket } from '@/hooks/use-websocket';
import router, { routerName } from '@/router';
import { useAppStore } from '@/store/app';
import { useNetworkStore } from '@/store/network';
import {
  BilldDeskBehaviorEnum,
  WsBilldDeskBehaviorType,
  WsBilldDeskStartRemote,
  WsBilldDeskStartRemoteResult,
  WsChangeAudioContentHintType,
  WsChangeMaxBitrateType,
  WsChangeMaxFramerateType,
  WsChangeResolutionRatioType,
  WsChangeVideoContentHintType,
  WsConnectStatusEnum,
  WsMsgTypeEnum,
} from '@/types/websocket';
import {
  ipcRenderer,
  ipcRendererInvoke,
  ipcRendererSend,
  resolveResolutionRatio,
  videoFullBox,
} from '@/utils';
import { deskLog } from '@/utils/desk-debug';

const route = useRoute();
const appStore = useAppStore();
const networkStore = useNetworkStore();

const {
  initWs,
  remoteDeskUserUuid,
  remoteDeskUserPassword,
  deskUserUuid,
  deskUserPassword,
  connectStatus,
} = useWebsocket();

const {
  maxBitrate,
  maxFramerate,
  resolutionRatio,
  audioContentHint,
  videoContentHint,
} = useRTCParams();

const { handleOpenDevTools } = useIpcRendererSend();

const titlebarHeight = ref(50);
const loading = ref(true);
const isWatchMode = ref(false);
const showCursor = ref(true);
const receiverId = ref('');
const loopBilldDeskUpdateUserTimer = ref();
const showDetail = ref(false);
const dragEl = ref<HTMLDivElement>();
const { style } = useDraggable(dragEl, {
  initialValue: { x: 40, y: 40 },
});
const currentMaxBitrate = ref(maxBitrate.value[3].value);
const currentMaxFramerate = ref(maxFramerate.value[4].value);
const currentResolutionRatio = ref(resolutionRatio.value[3].value);
const currentVideoContentHint = ref(videoContentHint.value[3].value);
const currentAudioContentHint = ref(audioContentHint.value[0].value);

let clickTimer: any;
let isLongClick = false;
const videoList = ref<HTMLVideoElement[]>([]);
const videoWrapRef = ref<HTMLVideoElement>();
const windowId = ref(WINDOW_ID_ENUM.webrtc);
const roomId = ref('');
const videoMap = ref(new Map());
const mySocketId = computed(() => {
  return networkStore.wsMap.get(roomId.value)?.socketIo?.id || '';
});

const rtcRtt = computed(() => {
  const arr: string[] = [];
  networkStore.rtcMap.forEach((rtc) => {
    arr.push(`${rtc.rtt}ms`);
  });
  return arr.join();
});

const rtcLoss = computed(() => {
  const arr: string[] = [];
  networkStore.rtcMap.forEach((rtc) => {
    arr.push(`${Number(rtc.loss.toFixed(2))}%`);
  });
  return arr.join();
});

const initVideo = ref(true);
const displayMode = ref<'fit' | 'native'>('fit');
watch(displayMode, () => {
  videoList.value.forEach((video) => handleVideoElSize(video));
});
const clickNum = ref(0);
const loopReconnectTimer = ref();
const actualVideoStats = computed(() =>
  Array.from(networkStore.rtcMap.values()).flatMap((rtc) => rtc.videoStats)
);
const receivedVideoStats = computed(() =>
  actualVideoStats.value.find((metric) => metric.stage === '接收')
);
const actualDisplay = computed(() => {
  // rtcMap 每秒更新，随统计刷新实际渲染尺寸和缩放倍数。
  const rtc = Array.from(networkStore.rtcMap.values())[0];
  if (!rtc?.videoStats.length || !rtc.videoEl.videoWidth) return '等待视频';
  const video = rtc.videoEl;
  const rect = video.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const width = Math.round(rect.width * ratio);
  const height = Math.round(rect.height * ratio);
  const scale = Math.max(width / video.videoWidth, height / video.videoHeight);
  return `${width}×${height} 物理像素，缩放 ${scale.toFixed(2)}×（大于 1 为放大）`;
});

onMounted(() => {
  console.log('webrtc页面');
  console.log(route.query);
  if (route.query.deskUserUuid !== undefined) {
    deskUserUuid.value = String(route.query.deskUserUuid);
  } else {
    window.$message.error('设备代码为空');
    return;
  }
  if (route.query.deskUserPassword !== undefined) {
    deskUserPassword.value = String(route.query.deskUserPassword);
  } else {
    window.$message.error('临时密码为空');
    return;
  }
  if (route.query.remoteDeskUserUuid !== undefined) {
    remoteDeskUserUuid.value = String(route.query.remoteDeskUserUuid);
  } else {
    window.$message.error('远程设备代码为空');
    return;
  }
  if (route.query.remoteDeskUserPassword !== undefined) {
    remoteDeskUserPassword.value = String(route.query.remoteDeskUserPassword);
  } else {
    window.$message.error('远程设备密码为空');
    return;
  }
  if (route.query.roomId !== undefined) {
    roomId.value = String(route.query.roomId);
  }
  if (route.query.maxBitrate !== undefined) {
    currentMaxBitrate.value = Number(route.query.maxBitrate);
  }
  if (route.query.maxFramerate !== undefined) {
    currentMaxFramerate.value = Number(route.query.maxFramerate);
  }
  if (route.query.resolutionRatio !== undefined) {
    currentResolutionRatio.value = Number(route.query.resolutionRatio);
  }
  if (route.query.videoContentHint !== undefined) {
    currentVideoContentHint.value = String(route.query.videoContentHint);
  }
  if (route.query.audioContentHint !== undefined) {
    currentAudioContentHint.value = String(route.query.audioContentHint);
  }
  init();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  clearInterval(loopBilldDeskUpdateUserTimer.value);
  clearConnectTimeout();
  videoWrapRef.value?.removeEventListener('wheel', handleMouseWheel);
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keydown', handleKeyCombination);

  window.removeEventListener('keyup', handleKeyUp);
  networkStore.removeAllWsAndRtc();
});

function handleOpenDebug() {
  if (clickNum.value < 5) {
    clickNum.value += 1;
    setTimeout(() => {
      clickNum.value = 1;
    }, 3000);
  } else {
    appStore.showDebug = true;
  }
}

function handleKeyCombination(event: KeyboardEvent) {
  if (isWatchMode.value) return;
  if (event.ctrlKey) {
    const key = event.key.toLowerCase();
    ENGLISH_LETTER.forEach((item) => {
      if (item === key) {
        console.log(`Ctrl+${key} 被按下`);
        networkStore.rtcMap
          .get(receiverId.value)
          ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
            requestId: getRandomString(8),
            msgType: WsMsgTypeEnum.billdDeskBehavior,
            data: {
              roomId: roomId.value,
              sender: mySocketId.value,
              receiver: receiverId.value,
              type: BilldDeskBehaviorEnum.keyboardPressKey,
              key: [
                NUT_KEY_MAP.ControlLeft,
                NUT_KEY_MAP[event.code] ||
                  NUT_KEY_MAP[event.key.toUpperCase()] ||
                  event.key,
              ],
              x: 0,
              y: 0,
              amount: 0,
            },
          });
      }
    });
  }
  if (event.metaKey) {
    const key = event.key.toLowerCase();
    ENGLISH_LETTER.forEach((item) => {
      if (item === key) {
        console.log(`MetaKey+${key} 被按下`);
        networkStore.rtcMap
          .get(receiverId.value)
          ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
            requestId: getRandomString(8),
            msgType: WsMsgTypeEnum.billdDeskBehavior,
            data: {
              roomId: roomId.value,
              sender: mySocketId.value,
              receiver: receiverId.value,
              type: BilldDeskBehaviorEnum.keyboardPressKey,
              key: [
                NUT_KEY_MAP.MetaLeft,
                NUT_KEY_MAP[event.code] ||
                  NUT_KEY_MAP[event.key.toUpperCase()] ||
                  event.key,
              ],
              x: 0,
              y: 0,
              amount: 0,
            },
          });
      }
    });
  }
}

function handleResize() {
  videoList.value.forEach((item) => {
    handleVideoElSize(item, false);
  });
}

function init() {
  handleInitIpcRendererOn();
  handleInitIpcRendererSend();
  handleLoopBilldDeskUpdateUserTimer();
  startConnectTimeout();
  videoWrapRef.value?.addEventListener('wheel', handleMouseWheel);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keydown', handleKeyCombination);
  window.addEventListener('keyup', handleKeyUp);
  initWs({
    roomId: roomId.value,
    isAnchor: false,
    isRemoteDesk: true,
  });
}

watch(
  () => connectStatus.value,
  (newval) => {
    console.log('connectStatus', newval);
    if (newval === WsConnectStatusEnum.connect) {
      clearInterval(loopReconnectTimer.value);
      handleWsMsg();
    } else if (newval === WsConnectStatusEnum.disconnect) {
      console.log('disconnect');
    }
  },
  { immediate: true }
);

watch(
  () => currentMaxBitrate.value,
  (newval) => {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsChangeMaxBitrateType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.changeMaxBitrate,
        data: {
          live_room_id: Number(roomId.value),
          val: newval,
        },
      });
  }
);
watch(
  () => currentMaxFramerate.value,
  (newval) => {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsChangeMaxFramerateType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.changeMaxFramerate,
        data: {
          live_room_id: Number(roomId.value),
          val: newval,
        },
      });
  }
);
watch(
  () => currentResolutionRatio.value,
  (newval) => {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsChangeResolutionRatioType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.changeResolutionRatio,
        data: {
          live_room_id: Number(roomId.value),
          val: resolveResolutionRatio(newval),
        },
      });
  }
);
watch(
  () => currentVideoContentHint.value,
  (newval) => {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsChangeVideoContentHintType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.changeVideoContentHint,
        data: {
          live_room_id: Number(roomId.value),
          val: newval,
        },
      });
  }
);
watch(
  () => currentAudioContentHint.value,
  (newval) => {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsChangeAudioContentHintType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.changeAudioContentHint,
        data: {
          live_room_id: Number(roomId.value),
          val: newval,
        },
      });
  }
);

function handleLoopBilldDeskUpdateUserTimer() {
  clearInterval(loopBilldDeskUpdateUserTimer.value);
  loopBilldDeskUpdateUserTimer.value = setInterval(() => {
    networkStore.wsMap.get(roomId.value)?.send<WsBilldDeskStartRemote['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.billdDeskUpdateUser,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: '',
        maxBitrate: currentMaxBitrate.value,
        maxFramerate: currentMaxFramerate.value,
        resolutionRatio: resolveResolutionRatio(currentResolutionRatio.value),
        videoContentHint: currentVideoContentHint.value,
        audioContentHint: currentAudioContentHint.value,
        deskUserUuid: deskUserUuid.value,
        deskUserPassword: deskUserPassword.value,
        remoteDeskUserUuid: remoteDeskUserUuid.value,
        remoteDeskUserPassword: remoteDeskUserPassword.value,
      },
    });
  }, 1000 * 2);
}

function handleWsMsg() {
  const ws = networkStore.wsMap.get(roomId.value);
  // 收到billdDeskStartRemoteResult
  ws?.socketIo?.on(
    WsMsgTypeEnum.billdDeskStartRemoteResult,
    (data: WsBilldDeskStartRemoteResult['data']) => {
      console.log('收到billdDeskStartRemoteResult', data);
      if (data.code !== 0) {
        useTip({
          content: data.msg,
          hiddenCancel: true,
          hiddenClose: true,
        });
        // 启动失败（被控端离线、密码失效等）就不要停在空白页了
        clearConnectTimeout();
        deskLog('远控启动失败，2 秒后自动关闭窗口', {
          code: data.code,
          msg: data.msg,
        });
        closeSelfWindow(2000);
      } else {
        if (data.data) {
          receiverId.value = data.data.receiver;
          appStore.remoteDesk.set(data.data.receiver, {
            deskUserUuid: data.data.deskUserUuid,
            remoteDeskUserUuid: data.data.remoteDeskUserUuid,
            audioContentHint: data.data.audioContentHint,
            videoContentHint: data.data.videoContentHint,
            sender: data.data.sender,
            isClose: false,
            maxBitrate: data.data.maxBitrate,
            maxFramerate: data.data.maxFramerate,
            resolutionRatio: data.data.resolutionRatio,
          });
        }
      }
    }
  );
  ws?.send<WsBilldDeskStartRemote['data']>({
    requestId: getRandomString(8),
    msgType: WsMsgTypeEnum.billdDeskStartRemote,
    data: {
      roomId: roomId.value,
      sender: mySocketId.value,
      receiver: '',
      maxBitrate: currentMaxBitrate.value,
      maxFramerate: currentMaxFramerate.value,
      resolutionRatio: resolveResolutionRatio(currentResolutionRatio.value),
      videoContentHint: currentVideoContentHint.value,
      audioContentHint: currentAudioContentHint.value,
      deskUserUuid: deskUserUuid.value,
      deskUserPassword: deskUserPassword.value,
      remoteDeskUserUuid: remoteDeskUserUuid.value,
      remoteDeskUserPassword: remoteDeskUserPassword.value,
    },
  });
}

function handleInitIpcRendererSend() {}

function handleInitIpcRendererOn() {}

function handleMouseWheel(event: WheelEvent) {
  if (isWatchMode.value) return;
  event.preventDefault();
  if (event.deltaY > 0) {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.billdDeskBehavior,
        data: {
          roomId: roomId.value,
          sender: mySocketId.value,
          receiver: receiverId.value,
          type: BilldDeskBehaviorEnum.scrollDown,
          key: [0],
          x: 0,
          y: 0,
          amount: Math.abs(event.deltaY),
        },
      });
  } else if (event.deltaY < 0) {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.billdDeskBehavior,
        data: {
          roomId: roomId.value,
          sender: mySocketId.value,
          receiver: receiverId.value,
          type: BilldDeskBehaviorEnum.scrollUp,
          key: [0],
          x: 0,
          y: 0,
          amount: Math.abs(event.deltaY),
        },
      });
  }
  if (event.deltaX > 0) {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.billdDeskBehavior,
        data: {
          roomId: roomId.value,
          sender: mySocketId.value,
          receiver: receiverId.value,
          type: BilldDeskBehaviorEnum.scrollRight,
          key: [0],
          x: 0,
          y: 0,
          amount: Math.abs(event.deltaX),
        },
      });
  } else if (event.deltaX < 0) {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.billdDeskBehavior,
        data: {
          roomId: roomId.value,
          sender: mySocketId.value,
          receiver: receiverId.value,
          type: BilldDeskBehaviorEnum.scrollLeft,
          key: [0],
          x: 0,
          y: 0,
          amount: Math.abs(event.deltaX),
        },
      });
  }
}

function handleClose() {
  networkStore.removeAllWsAndRtc();
  if (!ipcRenderer) {
    router.push({ name: routerName.remote });
    setTimeout(() => {
      windowReload();
    }, 300);
  }
}

/** 进入页面后迟迟没有画面时的提示文案 */
const connectTimeoutTip = ref('');
let connectTimeoutTimer: ReturnType<typeof setTimeout> | undefined;

function clearConnectTimeout() {
  if (connectTimeoutTimer) {
    clearTimeout(connectTimeoutTimer);
    connectTimeoutTimer = undefined;
  }
  connectTimeoutTip.value = '';
}

/** 兜底：设备离线时信令会失败或一直等不到 offer，避免停在一个空白窗口 */
function startConnectTimeout() {
  clearConnectTimeout();
  connectTimeoutTimer = setTimeout(() => {
    const videoEl = document.querySelector('video');
    if (!videoEl || !videoEl.videoWidth) {
      connectTimeoutTip.value = '长时间未收到画面，设备可能已离线或网络不通';
      deskLog('连接超时：没有收到任何视频帧', {
        roomId: roomId.value,
        receiverId: receiverId.value || '(空)',
      });
    }
  }, 12000);
}

/** 关闭当前远控窗口：Electron 关子窗口，浏览器回主页面 */
function closeSelfWindow(delay = 0) {
  const doClose = () => {
    networkStore.removeAllWsAndRtc();
    if (ipcRenderer) {
      ipcRendererSend({
        windowId: WINDOW_ID_ENUM.webrtc,
        channel: IPC_EVENT.closeWindow,
        requestId: getRandomString(8),
        data: {},
      });
    } else {
      router.replace({ name: routerName.remote });
    }
  };
  if (delay > 0) {
    setTimeout(doClose, delay);
  } else {
    doClose();
  }
}

function handleVideoElSize(videoEl, setWindowBounds = false) {
  if (!videoWrapRef.value) return;
  let clientWidth = document.documentElement.clientWidth;
  let clientHeight = document.documentElement.clientHeight;
  if (ipcRenderer && initVideo.value) {
    initVideo.value = false;
    clientWidth = window.screen.availWidth;
    clientHeight = window.screen.availHeight;
  }

  const res = computeBox({
    width: videoEl.videoWidth,
    height: videoEl.videoHeight,
    maxHeight: clientHeight,
    minHeight: clientHeight,
    maxWidth: clientWidth,
    minWidth: clientWidth,
  });

  videoFullBox({
    wrapSize: {
      width: clientWidth,
      height: clientHeight,
    },
    videoEl,
    mode: displayMode.value,
  });

  if (res.width && res.height && setWindowBounds) {
    ipcRendererSend({
      windowId: windowId.value,
      channel: IPC_EVENT.setWindowBounds,
      requestId: getRandomString(8),
      data: {
        width: Math.ceil(res.width),
        height: Math.ceil(res.height + titlebarHeight.value),
      },
    });
  }
}

watch(
  () => appStore.remoteDesk.size,
  (newval) => {
    if (!newval) {
      networkStore.removeAllWsAndRtc();
    }
  }
);

watch(
  () => networkStore.rtcMap,
  (newVal) => {
    newVal.forEach((item) => {
      if (videoWrapRef.value) {
        if (videoMap.value.has(item.receiver)) {
          if (item.peerConnection?.iceConnectionState === 'connected') {
            loading.value = false;
          }
          return;
        }

        videoMap.value.set(item.receiver, 1);
        item.videoEl.addEventListener('loadedmetadata', async () => {
          const res1 = await ipcRendererInvoke({
            windowId: windowId.value,
            channel: IPC_EVENT.getWindowTitlebarHeight,
            requestId: getRandomString(8),
            data: {},
          });
          if (res1?.code === 0) {
            titlebarHeight.value = res1.data.height;
          }
          handleVideoElSize(item.videoEl, true);
        });
        videoList.value.push(item.videoEl);
        videoWrapRef.value.appendChild(item.videoEl);
      }
    });
    nextTick(() => {
      if (videoWrapRef.value) {
        if (newVal.size) {
          videoWrapRef.value.style.display = 'inline-block';
        } else {
          videoWrapRef.value.style.removeProperty('display');
        }
      }
    });
  },
  {
    deep: true,
    immediate: true,
  }
);

function handleCopy(str) {
  copyToClipBoard(str);
  window.$message.success('复制成功');
}

function handleKeyDown(event: KeyboardEvent) {
  if (isWatchMode.value) return;
  if (event.ctrlKey || event.metaKey) {
    return;
  }
  networkStore.rtcMap
    .get(receiverId.value)
    ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.billdDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        type: BilldDeskBehaviorEnum.keyboardPressKey,
        key: [
          NUT_KEY_MAP[event.code] ||
            NUT_KEY_MAP[event.key.toUpperCase()] ||
            event.key,
        ],
        x: 0,
        y: 0,
        amount: 0,
      },
    });
}

function handleKeyUp(event: KeyboardEvent) {
  if (isWatchMode.value) return;
  if (event.ctrlKey || event.metaKey) {
    return;
  }
  networkStore.rtcMap
    .get(receiverId.value)
    ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.billdDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        type: BilldDeskBehaviorEnum.keyboardReleaseKey,
        key: [
          NUT_KEY_MAP[event.code] ||
            NUT_KEY_MAP[event.key.toUpperCase()] ||
            event.key,
        ],
        x: 0,
        y: 0,
        amount: 0,
      },
    });
}

function handleDoublelclick() {
  networkStore.rtcMap
    .get(receiverId.value)
    ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.billdDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        type: BilldDeskBehaviorEnum.doubleClick,
        key: [0],
        x: 0,
        y: 0,
        amount: 0,
      },
    });
}

function handleContextmenu() {
  networkStore.rtcMap
    .get(receiverId.value)
    ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.billdDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        type: BilldDeskBehaviorEnum.rightClick,
        key: [0],
        x: 0,
        y: 0,
        amount: 0,
      },
    });
}

function handleMouseDown(event: MouseEvent) {
  clickTimer = setTimeout(function () {
    console.log('长按');
    isLongClick = true;
    clearTimeout(clickTimer);
  }, 300);
  // 获取点击相对于视窗的位置
  const clickX = event.clientX;
  const clickY = event.clientY;

  // 获取目标元素的位置和尺寸信息
  // @ts-ignore
  const rect: DOMRect = event.target.getBoundingClientRect();
  // 计算点击位置相对于元素的坐标
  const xInsideElement = clickX - rect.left;
  const yInsideElement = clickY - rect.top;
  const x = (xInsideElement / rect.width) * 1000;
  const y = (yInsideElement / rect.height) * 1000;
  console.log('handleMouseDown', x, y, xInsideElement, yInsideElement);
  if (event.button === 2) {
    console.log('handleMouseDown-当前是鼠标右键');
    return;
  }
  networkStore.rtcMap
    .get(receiverId.value)
    ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.billdDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        key: [0],
        type: BilldDeskBehaviorEnum.pressButtonLeft,
        x,
        y,
        amount: 0,
      },
    });
}

function handleMouseMove(event: MouseEvent) {
  // 获取点击相对于视窗的位置
  const clickX = event.clientX;
  const clickY = event.clientY;

  // 获取目标元素的位置和尺寸信息
  // @ts-ignore
  const rect: DOMRect = event.target.getBoundingClientRect();
  // 计算点击位置相对于元素的坐标
  const xInsideElement = clickX - rect.left;
  const yInsideElement = clickY - rect.top;
  const x = (xInsideElement / rect.width) * 1000;
  const y = (yInsideElement / rect.height) * 1000;
  const requestId = getRandomString(8);
  console.log(
    'handleMouseMove',
    requestId,
    x,
    y,
    xInsideElement,
    yInsideElement
  );
  networkStore.rtcMap
    .get(receiverId.value)
    ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
      requestId,
      msgType: WsMsgTypeEnum.billdDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        type: BilldDeskBehaviorEnum.mouseMove,
        key: [0],
        x,
        y,
        amount: 0,
      },
    });
}

function handleMouseUp(event: MouseEvent) {
  if (clickTimer) {
    clearTimeout(clickTimer);
  }
  // 获取点击相对于视窗的位置
  const clickX = event.clientX;
  const clickY = event.clientY;

  // 获取目标元素的位置和尺寸信息
  // @ts-ignore
  const rect: DOMRect = event.target.getBoundingClientRect();
  // 计算点击位置相对于元素的坐标
  const xInsideElement = clickX - rect.left;
  const yInsideElement = clickY - rect.top;
  const x = (xInsideElement / rect.width) * 1000;
  const y = (yInsideElement / rect.height) * 1000;
  console.log('handleMouseUp', x, y, xInsideElement, yInsideElement);
  if (event.button === 2) {
    console.log('handleMouseUp-当前是鼠标右键');
    return;
  }
  networkStore.rtcMap
    .get(receiverId.value)
    ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.billdDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        key: [0],
        type: isLongClick
          ? BilldDeskBehaviorEnum.releaseButtonLeft
          : BilldDeskBehaviorEnum.releaseButtonLeft,
        x,
        y,
        amount: 0,
      },
    });
  isLongClick = false;
}
</script>

<style lang="scss" scoped>
.webrtc-wrap {
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  &.native-size {
    overflow: auto;
    .remote-video {
      max-width: none;
      max-height: none;
    }
  }
  .drag {
    position: fixed;
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: white;
    box-shadow:
      rgba(0, 0, 0, 0.15) 0px 15px 25px,
      rgba(0, 0, 0, 0.05) 0px 5px 10px;
    .txt {
      cursor: pointer;

      user-select: none;
    }

    .info {
      position: absolute;
      top: 100%;
      left: 0;
      display: none;
      box-sizing: border-box;
      padding: 10px;
      width: 800px;
      background-color: white;
      box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
      .debug-area {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 30px;
        height: 30px;
      }
      .debug-info {
        position: absolute;
        right: 0;
        bottom: 0;
        z-index: 99;
        padding-right: 5px;
        font-size: 12px;
        .item {
          cursor: pointer;
        }
        .link {
          color: red;
          cursor: pointer;
        }
      }
      .link-config {
        position: relative;
        z-index: 9;
        margin-top: 10px;
        .link-item {
          margin-bottom: 4px;
          .link-label {
            width: 80px;
            text-align: right;
          }
          .btn {
            padding: 2px 10px;
            border-radius: 5px;
            background-color: red;
            color: white;
            text-align: center;
            cursor: pointer;
          }
        }
      }
      &.show {
        display: block;
      }
    }
  }
  .remote-video {
    max-width: 100vw;
    max-height: 100vh;
    line-height: 0;
    &.hide-cursor {
      cursor: none;
    }
    &.watch {
      pointer-events: none;
    }
  }
  .loading {
    position: fixed;
    top: 50%;
    left: 50%;
    font-size: 30px;
    transform: translate(-50%, -50%);
  }
  .connect-timeout {
    position: fixed;
    top: 50%;
    left: 50%;
    z-index: 99;
    min-width: 280px;
    padding: 20px 28px;
    text-align: center;
    color: #fff;
    background: rgba(0, 0, 0, 0.78);
    border-radius: 8px;
    transform: translate(-50%, -50%);
    .txt {
      font-size: 14px;
      line-height: 1.6;
    }
    .btn {
      margin-top: 14px;
      font-size: 14px;
      color: #ffd700;
      cursor: pointer;
    }
  }
}
</style>
