<template>
  <div>
    <h1 class="fw4">Changelog</h1>

    <h2 class="fw6 f4 flex items-center update-title">2017-11-27: Rooms rewrite & more</h2>
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
          As a brief explanation of why this would happen: To make Umi even faster, the website caches a copy of all its code, so it doesn't even need to contact the Umi servers to run. Since the website doesn't contact the server when you first open it, the website has to check for updates after it's loaded. This is when you'd get the update notification.
          <div class="mb2"></div>
          I set the old system up to continually check for updates, including while you're using the player. Part of this was because of the rooms system, as it was very fickle with people leaving, so I didn't want to make it so auto updated while in a room. Now that rooms are a lot more stable, Umi will just check for updates when you first open the site, and automatically refresh if there's an update. You'll get a notification that links you here for details on the updates.
        </li>
        <li>
          <b class="fw6">What's next:</b>
          I'm generally pretty happy with how Umi has progressed so far, and I hope you're enjoying using it. I do still have some ideas for the future, though! Here are some, in no particular planned order of adding them:
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


