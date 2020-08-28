<template>
  <div>
    <h1 class="fw4">Changelog</h1>

        <h2 class="fw6 f4 flex items-center update-title">2020-08-27: This thing is still on? (Umi is working again!)</h2>
    <div class="lh-copy">
      <ul class="changelog-list">
        <li>
          No, really? Hi! It's been a while. In fact, we probably haven't met, since I stopped updating this in 2018, so you've never seen this page. However, a few of you reached out to me, and said Umi broke recently. So, I've fixed it. No extension or anything needed, it should, hopefully, just work.
        </li>
        <li>
          I just took a look at the analytics, and turns out a lot of you started using this during the pandemic. Let me know on GitHub or Twitter if anything else breaks. Cheers!
        </li>
      </ul>
    </div>

    <h2 class="fw6 f4 flex items-center update-title">2018-10-09: AniList integration</h2>
    <div class="lh-copy">
      <ul class="changelog-list">
        <li>
          You've probably noticed that the MyAnimeList integration hasn't been working for a while. That's because MyAnimeList shuttered their API until further notice, due to some security issues. As it still seems like it's a ways off until MyAnimeList's API is working again, I decided to integrate AniList support into Umi. It's actually a bit nicer than the MyAnimeList integration, since you do the sign-in on AniList's site, which is a lot safer for you. I hope to add back MyAnimeList once they release their new, safer API.
        </li>
        <li>
          Fixed an issue where an episode's timeline thumbnails weren't loading.
        </li>
        <li>
          As an aside: Umi hasn't been updated in a bit because I haven't been using it nearly as much, as I haven't been watching that much anime. Thankfully, Umi has been in a pretty good state since the last update. It's still a lot faster than Crunchyroll's site, even with their HTML5 player, and there haven't been any major issues. I have no timeline for any more major additions, but if inspiration strikes, you may see some more updates soon. I will make a dark mode happen at some point!
        </li>
      </ul>
    </div>

    <h2 class="fw6 f4 flex items-center update-title">2018-03-27: All series work again!!</h2>
    <div class="lh-copy">
      <ul class="changelog-list">
        <li>
          If you've tried to use Umi for the last few weeks, you'll have noticed that new series and episodes stopped working. I initially thought this was unfixable, and published a letter wishing you all well. Well... hopefully you've come back for some reason, as I figured out a way to get it working again! It's not absolutely perfect, as it requires you to <strong>install an extension for <a href="https://chrome.google.com/webstore/detail/umi-enabler/ebpgknlgpomojokdkpgphjigniicjcgc" target="_blank">Chrome</a> or <a href="https://addons.mozilla.org/en-US/firefox/addon/umi-enabler/" target="_blank">Firefox</a></strong>. However, unlike many other extensions that hook into Crunchyroll, I don't need to grab your credentials in the extension, so it satisfies my personal safety requirements. (The quick technical rundown is that it just changes the CORS headers on the incoming video responses.)
        </li>
        <li>
          In other news, I teased to some people that I may work on a desktop app of Umi that also works with sites like Funimation and HiDive. I'm still planning to work on this eventually! I may also be able to make it work in the browser as well, thanks to this Chrome extension, but I wouldn't hold my breath on it. I wanted to release this extension now though, so that people can continue to use Umi. Happy watching!
        </li>
      </ul>
    </div>

    <h2 class="fw6 f4 flex items-center update-title">2018-02-03: Video player thumbnails & improvements</h2>
    <div class="lh-copy">
      <ul class="changelog-list">
        <li>
          When you hover across the timeline of a video, previews of the video at that time will appear!
        </li>
        <li>
          You'll no longer get any HTTPS errors when using Umi. All communication to the Crunchyroll servers was done over HTTPS, but stuff like the posters for a series or thumbnails of an episode were over HTTP, as Crunchyroll only serves them over HTTP. (2018!) I'm now proxying their CDN, so it will be HTTPS.
        </li>
        <li>
          Dropped support for some older browsers, which allows the code to be a bit smaller and hopefully a tiny bit faster.
        </li>
        <li>
          Fix a bug with the message shown in host-only mode showing if you overscrolled upwards (possible with a trackpad on Mac/iOS, maybe Windows too but I only have a desktop PC).
        </li>
      </ul>
    </div>

    <h2 class="fw6 f4 flex items-center update-title">2018-01-23: Host-only mode for rooms</h2>
    <div class="lh-copy">
      <ul class="changelog-list">
        <li>
          As the title implies, rooms now have a new feature: <strong>Host-only mode.</strong> If you create a room, you'll now see a checkbox for this mode in the room popup. When toggled on, only you (the host) will be able to play/pause/change episode/etc. This is useful if you're doing a large group watch, and don't want people accidentally (or purposely 😈) messing with the video. It might still be a little rough around the edges, so if you find any bugs, please let me know <a href="https://github.com/remixz/umi/issues" target="_blank">on GitHub</a>. Happy watching!
        </li>
      </ul>
    </div>

    <h2 class="fw6 f4 flex items-center update-title">2017-12-08: Minor updates</h2>
    <div class="lh-copy">
      <ul class="changelog-list">
        <li>
          Umi will now prompt you if you need to sign in again due to your session expiring. A session might expire if you change your password, or if you don't use Umi for a little while.
          <ul class="mv1">
            <li>This fixes a bug where your queue and history data wouldn't load properly.</li>
          </ul>
        </li>
        <li>
          Improve player time syncing in rooms.
        </li>
        <li>
          Fix bug where language settings wouldn't load properly.
        </li>
        <li>
          Fix reaction selector being blurry when in fullscreen.
        </li>
        <li>
          Minor design updates.
        </li>
        <li>
          Happy holidays! <img src="https://cdn.frankerfacez.com/emoticon/108591/1" class="v-mid">
        </li>
      </ul>
    </div>

    <h2 class="fw6 f4 flex items-center update-title">2017-11-30: Rooms rewrite & more</h2>
    <div class="lh-copy">
      <ul class="changelog-list">
        <li>
          <b class="fw6">Rooms rewrite:</b>
          The rooms system has been completely rewritten from the ground up. You can <a href="https://github.com/remixz/umi/pull/5" target="_blank"> read the technical details here</a> if you're interested, but the gist of it is that the rooms are going to be much more reliable. One of the biggest changes as a result of this is that rooms no longer expire. This means you can now reuse old links! The link won't remember what you're watching last once everyone has left the room, but now you and your friends can just join a link whenever. This update also sets up Umi for some future improvements, like moderators, private rooms, custom links, and more.
        </li>
        <li>
          <b class="fw6">Improved update system:</b>
          TL;DR: Updates are now installed automatically. No more ugly yellow bar.
          <div class="mb2"></div>
          If you've been using Umi for a while, you've probably seen this ugly bar pop up every once in a while:
          <div class="w100 bg-light-yellow pa3 fw6 br1 shadow-1 tc mv3">
            <span>An update is ready to be installed.</span>
            <div class="f6 fw5 dib ml1 ba b--black bg-transparent bg-animate hover-bg-black hover-light-yellow br1 pointer ph2 pv1 tc" @click="installRefreshClicked = true">
              <span v-if="installRefreshClicked">
                <img src="https://cdn.frankerfacez.com/emoticon/189751/1" class="v-base mr1 nico"> <span class="">nico nico nii~~</span> <img src="https://cdn.frankerfacez.com/emoticon/189751/1" class="v-base ml1 nico">
              </span>
              <span v-else>Install and refresh</span>
            </div>
          </div>
          As a brief explanation of why this would happen: To make Umi even faster, the website stores a copy of all its code on your device, so it doesn't need to contact the Umi servers to load. Since the website doesn't contact the server when you first open it, the website has to check for updates after it has loaded. This is when you'd get the update notification.
          <div class="mb2"></div>
          I setup the old system to continually check for updates, including while you were using the player. Part of this was because of the old rooms system, as it was very fickle with people leaving, so I didn't want to make it so auto-update while you in a room. Now that rooms are a lot more stable, Umi will just check for updates when you first open the site, and automatically refresh if there's an update. You'll get a notification that links you here for details on the update.
        </li>
        <li>
          <b class="fw6">What's next:</b>
          I'm generally pretty happy with how Umi has progressed so far, and I hope you're enjoying using it. I do still have some ideas for the future though! Here are some, in no particular order of adding them:
          <ul class="mv1">
            <li>
              Spoilers mode (hides all thumbnails and episode titles)
            </li>
            <li>
              Improved rooms (moderators, private rooms, custom links)
            </li>
            <li>
              Support for additional streaming sites
            </li>
            <li>
              Offline support (if Crunchyroll adds it; technically Umi will load now if you're offline)
            </li>
            <li>
              Improved reactions (choose custom reactions instead of the default set)
            </li>
          </ul>
          If you have any suggestions or ideas for Umi, feel free to add them as issues <a href="https://github.com/remixz/umi/issues" target="_blank">on GitHub.</a> Happy watching!
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'changelog',
    metaInfo: {
      title: 'Changelog'
    },
    data () {
      return {
        installRefreshClicked: false
      }
    }
  }
</script>

<style scoped>
  .update-title:after {
    flex: 1 1 auto;
    content: '';
    height: 1px;
    margin-top: 5px;
    margin-left: 20px;
    background-color: #000;
  }

  .update-title:before {
    width: 20px;
    content: '';
    height: 1px;
    margin-top: 5px;
    margin-right: 20px;
    background-color: #000;
  }

  .changelog-list > li {
    margin-bottom: 0.5rem;
  }

  br {
    margin-bottom: 2rem;
  }

  .nico {
    height: 16px;
    position: relative;
    top: 2px;
  }
</style>
