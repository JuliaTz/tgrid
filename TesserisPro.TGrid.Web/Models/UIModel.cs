﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Web.Mvc;
using System.Web.Security;

namespace TesserisPro.TGrid.Web.Models
{
    public class UIModel
    {
        public string title { set; get; }
        public string url { set; get; }
        public string htmlUrl { set; get; }
        public string cssUrl { set; get; }
        public string jsUrl { set; get; }
        public string angularUrl { get; set; }
        public string angularHtmlUrl { set; get; }
        public string angularCssUrl { set; get; }
        public string angularJsUrl { set; get; }
    }
}
