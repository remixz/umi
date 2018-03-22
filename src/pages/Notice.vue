<template>
  <div>
    <h1 class="fw6 f2 mb0">The Future of Umi</h1>
    <h2 class="f5 gray fw4 mt1">March 21st, 2018</h2>
    <hr>
    <div class="lh-copy">
      <p>
        Hi there! I'm Zach, the guy who created this site.
      </p>
      <p>
        If you've tried to use Umi player in the last couple weeks, you've probably noticed that new episodes of anime aren't working anymore. <strong>Unfortunately, I must bear some bad news: Crunchyroll has started to secure to their new content in a way that I don't believe I can work around.</strong> As Crunchyroll inevitably migrates more content to this system, Umi will slowly stop working. You can read the technical details here: <a href="https://github.com/remixz/umi/issues/18#issuecomment-373978176">https://github.com/remixz/umi/issues/18#issuecomment-373978176</a>
      </p>
      <p>
        I'm not especially surprised this has happened now. A pirate site was released that worked in a very similar way to Umi, except that it required no account to log in, and would just steal the videos directly from Crunchyroll servers. In other words, these pirates could rehost anime at a decently high quality without paying anything in hosting, while adding their own advertisements. From a pirate's perspective, that's pretty much perfect. With that in mind, I definitely don't blame Crunchyroll for taking this action now. If anything, it should have been done sooner!
      </p>
      <p>
        To be honest, I'm not too sad that Crunchyroll is starting to secure their services, as I knew it would be inevitable. What I'm a bit more sad about is that so many people use this site (about one thousand every month!), presumably to watch anime with friends, family and others (though maybe they just like my amazing UI design 😉) and now won't be able to. Umi started as a fun passion project for me and my friends. I posted it to the MyAnimeList forums, but it didn't get any replies for months, so I assumed no one would use it, which is understandable due to it being non-official but still using Crunchyroll credentials. I was definitely surprised to see the numbers I did, and how it's grown pretty significantly every month. My favourite part was people sending me tweets (even if I didn't respond every time) or GitHub issues or emails, saying that they used it to watch anime with someone else. In its own weird way, it was a little community! I think that's so cool.
      </p>
      <p>
        I hope that maybe one day in the future, Crunchyroll will add a watch together feature natively. I believe it could be done while keeping their existing license terms with distributors, as they'd just need to enforce one streaming session for a specific episode for an account. That way, there'd be no balking over sharing accounts. It would just be two separate accounts (and therefore two separate revenue streams) streaming the same episode at the same time, something that happens all the time. I made this letter readable without logging in, so you can send it to Crunchyroll or something if you'd really like to nag them.
      </p>
      <p>
        So, consider this letter not only an explanation of what's going on, but as a big <strong>thank you</strong> to everyone who used Umi! I pretty much developed it for myself and my friends in mind most of the time (they chose all the reaction faces!), but it was really great to know that other people used it to have some fun together. As for what's next, I'll be leaving up Umi for the foreseeable future, since it still works for some content, and on mobile since it seems iOS and Android just ignore the security for videos. As well, when I bought the domain, there was a 5 years for 5 dollars promotion, so no reason to take it down. 😂 If I can fix Umi to start working again, I will, and maybe update this letter, or just remove it and pretend it never happened. As well, I may work on a downloadable version of Umi, which would let me ignore the security Crunchyroll has put in to stop it from working in the browser. I understand if people won't want to use that though, since it probably feels a bit less safe.
      </p>
      <p>
        If you have questions, comments, or anything else, please feel free to send them my way on <a href="https://twitter.com/zachbruggeman">Twitter (@zachbruggeman)</a>, or <a href="mailto:mail@bruggie.com">send me an email.</a> And if you work at Crunchyroll: Thanks for not breaking things until you had to because of pirates. 😂 I'd love to talk about some ideas, so email me if you're interested. 😉
      </p>
      <p>
        Thanks for reading this, and happy watching!
      </p>
      <p>Zach Bruggeman</p>
      <img src="https://orig10.deviantart.net/6379/f/2016/028/e/1/umi_by_ichigo_love_design-d9ppin0.gif" class="db center">
    </div>
  </div>
</template>

<script>
export default {
    name: 'thank-you',
    metaInfo: {
      title: 'The Future of Umi'
    },
}
</script>
